import * as Helper from './helper';
import * as Store from './store';
import * as User from './user';

const schema = {
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  article: {
    type: String,
    required: true
  }
};

export function *read(next) {
  var articleId = this.params.articleId;
  var collection = Store.collection(this, 'comment');
  this.assert(articleId, 400, 'missing article id');

  var sort = {};
  var skip = +this.query.skip || 0;
  var limit = +this.query.limit || 20;
  sort[this.query.sort || 'createdAt'] = -1;

  var comments = yield collection.find({article: articleId}, {skip, limit, sort}).toArray();
  var ret = [];

  for(let comment of comments) {
    this.params.name = comment.author;
    let author = yield User.read.call(this);
    author = author || {};
    comment.author = Helper.filter(['lastModified', 'createdAt'], author);
    comment = Helper.filter(['_id', 'article'], comment);
    ret.push(comment);
  }

  this.body = ret;
}

export function *create(next) {
  var comment = this.request.body;
  var collection = Store.collection(this, 'comment');
  var articleId = comment.article;

  this.assert(articleId, 400, 'missing article id');
  var count = yield Store.collection(this, 'article').count({id: articleId});
  this.assert(count === 1, 404, 'article not found');

  comment.author = this.cookies.get('n', {signed: true});
  var ret = Store.composeWithSchema(comment, schema);
  ret = yield collection.insert(ret);
  this.body = Helper.filter(['_id'], ret.ops[0]);
}

export function *update(next) {
  var id = this.params.is;
  var patch = this.request.body;

  // delete author
  delete patch.author;

  var collection = Store.collection(this, 'comment');
  var change = {};

  if(id) {
    var comment = yield collection.find({id}).limit(1).next();
    this.assert(comment, 404);
  }

  for(let key in patch) {
    var ret = Store.validSchema(key, patch, schema);
    if(!ret) continue;
    change[key] = ret.value;
  }

  var ops = yield collection.updateOne({id}, {$set: change});
  this.assert(ops.result.ok);
  this.body = {success: 1};
}

export function *del(next) {
  var id = this.params.id;
  var collection = Store.collection(this, 'comment');
  var ops = yield collection.remove({id});
  this.assert(ops.result.ok);
  this.body = {success: 1};
}