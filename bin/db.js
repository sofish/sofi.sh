const mongodb = require('mongodb');
const co = require('co');
const conf = require('../conf');

co(function *() {
  var db = yield mongodb.MongoClient.connect(conf.MONGODB.uri);
  var article = db.collection('article')

  // remove previous index
  yield article.dropIndexes({'articleTextIndex': 1});

  // re-index
  yield article.createIndex({
    title: 'text', content: 'text'
  }, {
    weights: {title: 5, content: 2},
    name: 'articleTextIndex'
  });

  // close db
  yield db.close();

  process.exit();
});
