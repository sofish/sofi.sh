import koa from 'koa';
import mongodb from 'mongodb';
import morgan from 'koa-morgan';
import bodyparser from 'koa-bodyparser';
import route from './router';

// app configuration
const conf = require('../conf');
const app = koa();

// print error to stdout
app.on('error', function (err, ctx) {
  let flag = '\n====================\nMIDDLEWARE_ERROR: \n====================\n';
  console.log(flag, err);
});

// log request
app.use(morgan.middleware('dev'));

// error handler
app.use(function *(next) {
  try {
    // modify this line to implement db authentication
    app.context.db = yield mongodb.MongoClient.connect(conf.MONGODB.uri);
    yield next;
  } catch (err) {
    this.status = err.status || 500;
    this.body = app.env.match(/^development|test$/) ? {error: err.message || this.message || err} : {error: this.message};
    this.app.emit('error', err, this);
  }
});

// parse body
app.use(bodyparser());

// routers
app.use(route.routes()).use(route.allowedMethods());

// 404
app.use(function *(next) {
  if(this.status === 404) this.body = {error: this.message};
  yield next;
});

// start the app
app.listen(conf.PORT, () => console.log(`server is running on localhost:${conf.PORT}`));