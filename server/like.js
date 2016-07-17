import * as Helper from './helper';
import * as Store from './store';
import * as User from './user';

const schema = {
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
  var id = this.params.articleId;
  this.assert(id, 404, 'missing article id');

  var collection = Store.collection(this, 'like');
  var skip = +this.query.skip || 0;
  var limit = +this.query.limit || 1000000;
  var sort = {};
  sort[this.query.sort || 'createdAt'] = -1;

  var query = {article: id};
  var likes = yield collection.find(query, {skip, limit, sort}).toArray();
  var list = [];

  for(let like of likes) {
    this.params.name = like.author;
    let author = yield User.read.call(this);
    author = author || {};
    like.author = Helper.filter(['lastModified', 'createdAt'], author);
    like = Helper.filter(['_id', 'article', 'lastModified', 'createdAt'], like);
    list.push(like);
  }

  this.body = list;
}

export function *create(next) {
  var like = {
    article: this.params.articleId,
    author: this.cookies.get('n', {signed: true})
  };
  var collection = Store.collection(this, 'like');

  var count = yield Store.collection(this, 'article').count({id: like.article});
  this.assert(count === 1, 404, 'article not found');

  var author = yield collection.find({author: like.author, article: like.article}).limit(1).next();
  this.assert(!author, 304);

  var ret = Store.composeWithSchema(like, schema);
  ret = yield collection.insert(ret);
  this.body = Helper.filter(['_id', 'createdAt', 'lastModified', 'id'], ret.ops[0]);
}

export function *del(next) {
  var id = this.params.id;
  var collection = Store.collection(this, 'like');
  var ops = yield collection.remove({id});
  this.assert(ops.result.ok);
  this.body = {success: 1};
}