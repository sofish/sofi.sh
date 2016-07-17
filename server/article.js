import * as Helper from './helper';
import * as Store from './store';
import * as User from './user';
import * as Search from './search';

const FILTERS = {};
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

FILTERS.related = function *related(id) {
  var collection = Store.collection(this, 'article');
  var article = yield collection.find({id}).limit(1).next();
  if(!article) return [];

  this.params.tags = article.tags.join('|');
  this.request.query.limit = this.request.query.limit || '3';
  return yield Search.tag.call(this);
};

FILTERS.prevAndNext = function *prevAndNext(id) {
  var collection = Store.collection(this, 'article');
  var article = yield collection.find({id}).limit(1).next();
  if(!article) return this.body = {previous: null, next: null};

  var next = yield collection.find({_id: {$gt: article._id}}).limit(1).next();
  var previous = yield collection.find({_id: {$lt: article._id}}).limit(1).next();

  if(next) {
    this.params.name = next.author;
    next.author = yield User.read.call(this);
    next.author = Helper.filter(['lastModified', 'createdAt'], next.author);
  } else if (previois) {
    this.params.name = previous.author;
    previous.author = yield User.read.call(this);
    previous.author = Helper.filter(['lastModified', 'createdAt'], previous.author);
  }

  this.body = {previous, next};
};

export function *read(next) {
  var title = this.params.title;
  var filter = this.params.filter;
  var collection = Store.collection(this, 'article');
  var id = title && title.slice(-8);

  // filters like related, previous, next article
  if(filter) {
    let f = FILTERS[filter];
    this.assert(f, 404, `filter: \`${filter}\` not found`);
    return yield f.call(this, id);
  }

  if(id) {
    this.assert(/\w{8}/.test(id), 404);
    var article = yield collection.find({id}).limit(1).next();
    this.assert(article, 404);

    article = Helper.filter(['_id'], article);

    this.params.name = article.author;
    var author = yield User.read.call(this);
    author = author || {};
    article.author = author;
    return this.body = article;
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