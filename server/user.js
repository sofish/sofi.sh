import * as Store from './store';
import * as Helper from './helper';

const ROLES = [1, 2, 3]; // reader, writer, admin
const schema = {
  name: {
    type: String,
    required: true
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
  var id = this.params.id;
  var collection = Store.collection(this, 'user');

  // user profile
  if(id) {
    var user = yield collection.find({id}).limit(1).next();
    if(!user) throw Helper.error(404);
    return this.body = Helper.filter(['password'], user);
  }

  // user list
  var skip = +this.query.skip || 0;
  var limit = +this.query.limit || 20;
  var sort = +this.query.sort || 'createdAt';

  var users = yield collection.find({}, {skip, limit, sort}).toArray();
  this.body = users.map(user => Helper.filter(['password'], user));
}

export function *create(next) {
  var user = this.request.body;
  var collection = Store.collection(this, 'user');

  var right = yield collection.find({name: user.name}).limit(1).next();
  if(right) throw Helper.error(500, `you can't use the name: \`${user.name}\``);

  var ret = Store.composeWithSchema(schema, user);
  ret = yield collection.insert(ret);
  this.body = Helper.filter(['password'], ret.ops[0]);
}

export function *update(next) {
  var id = this.params.id;
  var patch = this.request.body;
  var collection = Store.collection(this, 'user');
  var change = {};

  for(let key in patch) {
    var ret = Store.validSchema(key, patch[key], schema);
    if(!ret) continue;
    change[key] =
      key === 'password' ? Store.hash(patch[key]) :
      key === 'role' ? detectRole(patch[key]) : patch[key];
  }

  var ops = yield collection.updateOne({id}, {$set: change});
  if(ops.result.ok) {
    this.body = {success: 1};
  } else {
    throw Helper.error();
  }
}

export function *del(next) {
  var id = this.params.id;
  var collection = Store.collection(this, 'user');
  var ops = yield collection.remove({id});
  if(ops.result.ok) {
    this.body = {success: 1};
  } else {
    throw Helper.error();
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