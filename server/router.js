import router from 'koa-router';
import * as article from './article';
import * as comment from './comment';
import * as user from './user';

const route = router();

route.get('/article/:id?', article.read);
route.post('/article', article.create);
route.patch('/article/:id', article.update);
route.delete('/article/:id', article.del);

route.get('/comment/:id?', comment.read);
route.post('/comment', comment.create);
route.delete('/comment/:id', comment.del);

route.get('/user/:id?', user.read);
route.post('/user', user.create);
route.patch('/user/:id', user.update);
route.delete('/user/:id', user.del);

export default route;