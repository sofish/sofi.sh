var http = require('http');
var exec = require('child_process').exec

// hook for pull-request update
http.createServer(function(req, res) {

  exec('make dist', function(err) {
    var message = err ? err.message : 'build success';
    res.write(message);
    res.end();
  });

}).listen('3535');

console.log('build server is running at http://localhost:3535');
