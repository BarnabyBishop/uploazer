var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var babel = require("gulp-babel");

gulp.task('babel', function () {
  return gulp.src('src/app.js')
	.pipe(babel())
	.pipe(gulp.dest('dist'));
});


gulp.task('start', function() {
	nodemon({
		script: 'dist/app.js',
		ext: 'js'
	  })
	.on('change', ['babel'])
	.on('restart', function() {
		return console.log('Restarted!');
	});
});

gulp.task('default', ['babel', 'start']);