import * as Helper from './helper';
import * as Store from './store';

const schema = {
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  tags: {
    type: Array,
    default: []
  }
};

export function *read(next) {
  var title = this.params.title;
  var collection = Store.collection(this, 'article');
  var id = title && title.slice(-8);

  if(id) {
    this.assert(/\w{8}/.test(id), 404);
    var article = yield collection.find({id}).limit(1).next();
    this.assert(article, 404);
    return this.body = Helper.filter(['_id'], article);
  }

  // article list
  var sort = {};
  var skip = +this.query.skip || 0;
  var limit = +this.query.limit || 20;
  sort[this.query.sort || 'createdAt'] = -1;

  var articles = yield collection.find({}, {skip, limit, sort}).toArray();
  this.body = articles.map(article => Helper.filter(['_id'], article));
}

export function *create(next) {
  var article = this.request.body;
  var collection = Store.collection(this, 'article');

  article.author = this.cookies.get('n', {signed: true});
  var ret = Store.composeWithSchema(article, schema);
  ret = yield collection.insert(ret);
  this.body = Helper.filter(['_id'], ret.ops[0]);
}

export function *update(next) {
  var title = this.params.title;
  var patch = this.request.body;
  var id = title.slice(-8);

  // delete author
  delete patch.author;

  var collection = Store.collection(this, 'article');
  var change = {};

  if(id) {
    var article = yield collection.find({id}).limit(1).next();
    this.assert(article, 404);
  }

  for(let key in patch) {
    var ret = Store.validSchema(key, patch, schema);
    if(!ret) continue;
    change[key] = ret.value;
  }

  this.assert(Object.keys(change).length, 304, `not modified`);

  var ops = yield collection.updateOne({id}, {$set: change});
  this.assert(ops.result.ok);
  this.body = {success: 1};
}

export function *del(next) {
  var id = this.params.id;
  var collection = Store.collection(this, 'article');
  var ops = yield collection.remove({id});
  this.assert(ops.result.ok);
  this.body = {success: 1};
}