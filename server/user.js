import * as Store from './store';
import * as Helper from './helper';
import verify from './recaptcha';

const ROLES = [1, 2, 3]; // reader, writer, admin
const schema = {
  name: {
    type: String,
    required: true,
    length: [5],
    pattern: /^\S+$/,
    message: '`name` required at least 5 characters without space'
  },
  role: {
    type: Number,
    default: 1
  },
  password: {
    type: String,
    required: true
  }
};

export function *read(next) {
  var name = this.params.name;
  var collection = Store.collection(this, 'user');

  // user profile
  if(name) {
    var user = yield collection.find({name}).limit(1).next();
    this.assert(user, 404);
    return this.body = userFilter(user);
  }

  // only allow admin to query user list
  yield role(3);

  // user list
  var skip = +this.query.skip || 0;
  var limit = +this.query.limit || 20;
  var sort = +this.query.sort || 'createdAt';

  var users = yield collection.find({}, {skip, limit, sort}).toArray();
  this.body = users.map(userFilter);
}

export function *create(next) {
  var user = this.request.body;
  var reCaptcha = yield verify(user.recaptcha);
  this.assert(reCaptcha.success, 401, 'human?');

  var collection = Store.collection(this, 'user');
  var right = yield collection.find({name: user.name}).limit(1).next();
  this.assert(!right, 500, `you can't use the name: \`${user.name}\``);

  var ret = Store.composeWithSchema(user, schema);
  ret = yield collection.insert(ret);
  this.body = userFilter(ret.ops[0]);
}

export function *update(next) {
  var name = this.params.name;
  var patch = this.request.body;
  var collection = Store.collection(this, 'user');
  var change = {};

  for(let key in patch) {
    var ret = Store.validSchema(key, patch, schema);
    if(!ret) continue;
    change[key] =
      key === 'password' ? Store.hash(patch[key]) :
      key === 'role' ? detectRole(patch[key]) : patch[key];
  }

  var ops = yield collection.updateOne({name}, {$set: change});
  this.assert(ops.result.ok);
  this.body = {success: 1};
}

export function *del(next) {
  var name = this.params.name;
  var collection = Store.collection(this, 'user');
  var ops = yield collection.remove({name});
  this.assert(ops.result.ok);
  this.body = {success: 1};
}

/**
 * Middleware for user auth, and set user to current state
 * @param next
 * @returns {*}
 */
export function *auth(next) {
  var user = this.request.body;
  this.assert(user.recaptcha, 400, 'reCaptcha not found');
  this.assert(user.name && user.password, 401);
  
  var reCaptcha = yield verify(user.recaptcha);
  this.assert(reCaptcha.success, 401, 'human?');

  var realUser = yield Store.collection(this, 'user').find({name: user.name}).next();
  this.assert(realUser, 401);
  this.assert(Store.compare(user.password, realUser.password), 401);

  let options =  {
    signed: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    domain: this.hostname
  };

  this.state.user = userFilter(realUser);
  this.cookies.set('n', realUser.name, options);  // n represent for name
  this.cookies.set('r', realUser.role, options);   // r represent for role

  yield next;
  this.body = {authenticated: 1};
}

/**
 * detect admin: use after /user/auth middleware
 * @param level {Number} ROLES = [1, 2, 3]; // reader, writer, admin
 */
export function role(level) {
  return function *(next) {
    var role = this.cookies.get('r', {signed: true});

    // expected a specific level or admin(level 3)
    this.assert(role == level || role == 3, 401);
    return next ? (yield next) : +role;
  }
}

/**
 * detect and return a right role
 * @param num
 * @returns {number}
 */
function detectRole(num) {
  return ROLES.indexOf(num) !== -1 ? num : 1;
}

function userFilter(user) {
  return Helper.filter(['password', '_id'], user);
}