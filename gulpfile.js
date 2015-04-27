var gulp = require('gulp');
var concat = require('gulp-concat-util');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var inject = require('gulp-inject');
var map = require('./pages/core/resources/world-110m.json');

var fileHeader = '(function() {\n\'use strict\';\n\n';
var mapAssignment = 'var mapData = ' + JSON.stringify(map) + ';\n\n';
var fileFooter = '})();';
var directiveFile = 'globe.js';
var distNameBase = 'angular-globe';


gulp.task('concat:withMap', function() {
  gulp.src(directiveFile)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(concat(distNameBase + '-with-map' + '.js'))
    .pipe(concat.header(fileHeader + mapAssignment))
    .pipe(concat.footer(fileFooter))
    .pipe(gulp.dest('dist'))
    .pipe(rename({suffix : '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('concat:withoutMap', function() {
  gulp.src(directiveFile)
    .pipe(concat(distNameBase + '.js'))
    .pipe(concat.header(fileHeader))
    .pipe(concat.footer(fileFooter))
    .pipe(gulp.dest('dist'))
    .pipe(rename({suffix : '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('inject', function() {
  var target = gulp.src('index.html');
  var sources = gulp.src([
    'app.js',
    './dist/angular-globe-with-map.min.js',
    './pages/**/*.js',
    './pages/**/*.css'
  ], {read : false});

  return target.pipe(inject(sources, {
    addPrefix : 'angular-globe'
  }))
    .pipe(gulp.dest('.'));
});


gulp.task('inject:dev', function() {
  var target = gulp.src('index.html');
  var sources = gulp.src([
    'app.js',
    'mapData.js',
    'globe.js',
    './pages/**/*.js',
    './pages/**/*.css'
  ], {read : false});

  return target.pipe(inject(sources, {
    addPrefix : 'angular-globe'
  }))
    .pipe(gulp.dest('.'));
});

gulp.task('build', ['concat:withMap', 'concat:withoutMap']);
gulp.task('dev', ['inject:dev']);