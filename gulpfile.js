var gulp        = require('gulp'),
    rename      = require('gulp-rename');


var SRC_FILE    = ['./src/js/prepend.js', './bower_components/minivents/dist/minivents.js', './src/js/MathUtils.js', './src/js/raf.js', './src/js/VirtualScroll.js', './src/js/background.js', './src/js/scroller.js', './src/js/parallaxer.js', './src/js/append.js'];


gulp.task('hint', function () {
  var jshint = require('gulp-jshint');

  return gulp.src('./src/js/**/*.js')
             .pipe(jshint())
             .pipe(jshint.reporter('default'));
});

gulp.task('test', ['build'], function () {
  var mocha = require('gulp-mocha');
  return gulp.src('./test.js')
    .pipe(mocha());
});

gulp.task('css', function () {
  var less          = require('gulp-less'),
      autoprefixer  = require('gulp-autoprefixer');

  return gulp.src('./src/styles/parallaxer.less')
    .pipe(less())
    .pipe(autoprefixer({
      'browsers': ['last 2 versions'],
      'cascade': false
     }))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('concat', function() {
  var concat    = require('gulp-concat');

  return gulp.src(SRC_FILE)
             .pipe(concat('parallaxer.js') )
             .pipe(gulp.dest('./dist/js/'));
});

gulp.task('build', ['css', 'concat'], function () {
  var uglify = require('gulp-uglify');

  return gulp.src(['./dist/js/**/*', '!**/*.min.js'])
             .pipe(uglify())
             .pipe(rename(function(p) { p.basename += '.min'; }))
             .pipe(gulp.dest('./dist/js/'));
});

gulp.task('watch', function() {
   gulp.watch('./src/styles/**/*.less', ["css"]);
   gulp.watch('./src/js/**/*.js', ["hint", "concat"]);
});

gulp.task('default', ['test']);
