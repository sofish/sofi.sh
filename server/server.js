import koa from 'koa';
import mongodb from 'mongodb';
import morgan from 'koa-morgan';
import bodyparser from 'koa-bodyparser';
import helmet from 'koa-helmet';
import route from './router';

// app configuration
const conf = require('../conf');
const app = koa();

app.keys = conf.KEYS;

// print error to stdout
app.on('error', function (err, ctx) {
  console.log('MIDDLEWARE_ERROR: ', err);
});

// log request
app.use(morgan.middleware('dev'));

// secure: proper header with helmet
app.use(helmet());

// error handler
app.use(function *(next) {
  try {
    // modify this line to implement db authentication
    app.context.db = yield mongodb.MongoClient.connect(conf.MONGODB.uri);
    yield next;
  } catch (err) {
    this.status = err.status || 500;
    this.body = {error: err.message || this.message || err};
    this.app.emit('error', err, this);
  }
});

// parse body
app.use(bodyparser());

// routers
app.use(route.routes()).use(route.allowedMethods());

// start the app
app.listen(conf.PORT, () => console.log(`server is running on localhost:${conf.PORT}`));