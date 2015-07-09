var gulp = require('gulp');
var colors = require('gulp-util').colors;

// handler all errors
var errorHandler = function(err) {
  console.log(colors.red('ERROR: ') + colors.yellow(err.plugin) + colors.red(' =>'), err.message);
  this.emit('end');
};


// user configs
var config = require('./config');


// build jade to html
var jade = require('gulp-jade');
var jadePath = ['./article/**/*.jade', './theme/**/404.jade', './theme/**/500.jade'];
gulp.task('template', function() {
  return gulp.src(jadePath, { base: './' })
    .pipe(jade({
      locals: config,
      pretty: true
    }))
    .on('error', errorHandler)
    .pipe(gulp.dest('./.dist'));
});


// load js with babel loader
var jsPath = ['./article/**/*.js', './theme/**/*.js'];
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
gulp.task('js', function () {
  return gulp.src(jsPath, { base: './' })
    .pipe(babel())
    .on('error', errorHandler)
    .pipe(uglify())
    .on('error', errorHandler)
    .pipe(gulp.dest('./.dist'));
});


// load css with cssnext
var cssPath = ['./article/**/*.css', './theme/**/*.css'];
var cssnext = require('gulp-cssnext');
gulp.task('css', function () {
  return gulp.src(cssPath, { base: './' })
    .pipe(cssnext({
      browsers: ['ie > 8', 'chrome > 26', 'Firefox ESR'],
      plugins: [ require('postcss-nested') ]
    }))
    .on('error', errorHandler)
    .pipe(gulp.dest('./.dist'));
});


// js lint with jshint
var jshint = require('gulp-jshint');
gulp.task('lint', function() {
  return gulp.src(jsPath)
    .pipe(jshint({ esnext: true }));
});


// image compress
var imgPath = ['./article/**/*.@(gif|jpg|svg|png)'];
var imageop = require('gulp-image-optimization');
gulp.task('image', function(cb) {
  gulp.src(imgPath, {base: './' }).pipe(imageop({
    optimizationLevel: 5,
    progressive: true,
    interlaced: true
  }))
  .pipe(gulp.dest('./.dist')).on('end', cb).on('error', cb);
});

// build api from html files
var fs = require('fs');
var reg = {
  title: /<title>([^<]+)<\/title>/,
  description: /<meta name="description"[^=]+="([^"]+)"/
};

gulp.task('api', function() {
  gulp.src('./.dist/article/**/index.html', function(err, files) {
    if(err || !files.length) return;
    var articles = [];

    files.forEach(function(file) {
      var text = fs.readFileSync(file, 'utf-8');
      var stat = fs.statSync(file.replace('.dist/', '').replace(/\.html$/, '.jade'));

      articles.push({
         title: reg.title.exec(text)[1],
         description: reg.description.exec(text)[1],
         createdAt: stat.birthtime,
         updatedAt: stat.mtime,
         url: '/' + file.split('/').slice(-2, -1)
      });
    });

    // sort articles by birthtime
    articles.sort(function(a, b) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    var dir = files[1].split('.dist').slice(0, 1) + '.dist/api';
    if(!fs.existsSync(dir)) fs.mkdirSync(dir);
    fs.writeFileSync(dir + '/article.json', JSON.stringify(articles));
  }).on('error', errorHandler);
})

// clean .dist dir
var clean = require('gulp-clean');
gulp.task('clean', function () {
  return gulp.src('./.dist', { read: false })
    .pipe(clean());
});

// watcher for development
gulp.task('dev', ['js', 'css', 'image', 'template', 'api'], function() {
  gulp.watch(jsPath, ['js', 'lint']);
  gulp.watch(cssPath, ['css']);
  gulp.watch(imgPath, ['image']);

  // watch jade file in `theme/`, but dont convert it to html
  gulp.watch(jadePath.concat('./theme/**/*.jade'), ['template']);
  gulp.watch(['./.dist/article/**/index.html'], ['api']);
});


// build for production
gulp.task('dist', ['template', 'js', 'css', 'image']);
