var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var babel = require("gulp-babel")
var del = require('del');

/*
gulp.task('clean', function(done) {
  del(['dist'], done);
});


gulp.task('babel', ['clean'], function () {
    return gulp.src('src/app.js')
	  //.pipe(babel({ optional: 'asyncToGenerator' }))
	  .pipe(gulp.dest('dist'));
});
 ['babel'], */
gulp.task('start', function () {
  nodemon({ script: 'src/app.js' })
})

gulp.task('watch', function() {
	gulp.watch('src/*.js');
})

gulp.task('default', ['start', 'watch']);