import router from 'koa-router';
import * as article from './article';
import * as comment from './comment';
import * as user from './user';
import * as search from './search';

const route = router();

route.get('/article/:title?', article.read);
route.post('/article', user.role(2), article.create);
route.patch('/article/:title', user.role(1), article.update);
route.delete('/article/:title', user.role(1), article.del);

route.get('/comment/:id?', comment.read);
route.post('/comment', user.role(1), comment.create);
route.patch('/comment/:id', user.role(1), comment.update);
route.delete('/comment/:id', user.role(1), comment.del);

route.get('/user/:name?', user.read);
route.post('/user', user.role(3), user.create);
route.patch('/user/:name', user.role(1), user.update);
route.delete('/user/:name', user.role(1), user.del);
route.post('/auth', user.auth);

route.get('/tag/:name', search.tag);
route.get('/author/:name', search.author);
route.get('/search/:q', search.search);

export default route;