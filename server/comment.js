import * as Helper from './helper';
import * as Store from './store';

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
  var id = this.params.id;
  var collection = Store.collection(this, 'comment');

  if(id) {
    let comment = yield collection.find({id}).limit(1).next();
    this.assert(comment, 404);
    return this.body = Helper.filter(['_id'], comment);
  }

  // comment list
  var sort = {};
  var skip = +this.query.skip || 0;
  var limit = +this.query.limit || 20;
  sort[this.query.sort || 'createdAt'] = -1;

  var comments = yield collection.find({}, {skip, limit, sort}).toArray();
  this.body = comments.map(comment => Helper.filter(['_id'], comment));
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