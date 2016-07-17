import * as Store from './store';
import * as Helper from './helper';

// articles with a specific tag
export function *tag() {
  var tag = this.params.name;
  var collection = Store.collection(this, 'article');

  this.assert(tag, 400, 'missing tag name');

  var sort = {};
  var skip = +this.query.skip || 0;
  var limit = +this.query.limit || 20;
  sort[this.query.sort || 'createdAt'] = -1;

  var articles = yield collection.find({tags: {
    $in: [tag]
  }}, {limit, sort, skip}).toArray();

  this.body = articles.map(article => Helper.filter(['_id'], article));
}

// articles with a specific author
export function *author() {
  var author = this.params.name;
  this.assert(author, 400, 'missing author name');

  var sort = {};
  var skip = +this.query.skip || 0;
  var limit = +this.query.limit || 20;
  sort[this.query.sort || 'createdAt'] = -1;

  var collection = Store.collection(this, 'article');
  var articles = yield collection.find({author}, {limit, sort, skip}).toArray();

  this.body = articles.map(article => Helper.filter(['_id'], article));
}

// text search
export function *search() {
  var q = this.params.q;
  this.assert(q, 400, 'missing keyword');

  var sort = {score: {$meta: 'textScore'}};
  var skip = +this.query.skip || 0;
  var limit = +this.query.limit || 20;

  var collection = Store.collection(this, 'article');
  var articles = yield collection.find(
    {$text: {$search: q}},            // weights: ../bin.db.js
    {score: {$meta: 'textScore'}},    // ranking: sort with score
    {skip, limit, sort}
  ).toArray();

  this.body = articles.map(article => Helper.filter(['_id'], article));
}