var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var babel = require('gulp-babel')
var del = require('del');

gulp.task('start', function () {
  nodemon({ script: 'src/app.js' })
})

gulp.task('watch', function() {
	gulp.watch('src/*.js');
})

gulp.task('default', ['start', 'watch']);