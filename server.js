'use strict';

var http = require('http');
var exec = require('child_process').exec;
var url = require('url');

// hook for pull-request update
http.createServer(function(req, res) {

  // build server
  if(req.path === '/build') {
    exec('make dist', function(err) {
      var message = err ? err.message : 'build success';
      res.write(message);
      res.end();
    });
  }

  // search engine use `grep`
  if(req.url.match(/^\/search\/.+/)) {
    var keywords = decodeURIComponent(url.parse(req.url).path).split('/search/')[1].split(/\s+|[+]/);
    keywords = keywords.map(String).concat(keywords.join(' ')).join('|');

    exec(`egrep -irl '.dist/article' -e '${keywords}' --include=\*.html`, function(err, ret) {
      if(err) return res.end(JSON.stringify({
        error: {
          message: 'not found',
          code: 404
        }
      }));

      // limit to 5 items
      ret = ret.split('\n').reduce(function(ret, file) {
        if(file) ret.push('/' + file.split('/article/')[1].split('/')[0]);
        return ret;
      }, []).slice(0, 5);

      // find data in article.json
      var articles = require('./.dist/api/article');
      articles = articles.filter(function(cur) {
        return ret.indexOf(cur.url) !== -1;
      });

      res.end(JSON.stringify({ data: articles }));
    });
  }

}).listen('3535');

console.log(process.pid, 'build server is running at http://localhost:3535');
