var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');

gulp.task('default', function () {
    
});

gulp.task('js', function(){
    return gulp
    .src(['src/index.js', 'src/xml/*.js', 'src/*/*.js'])
    .pipe(concat('ejs.js'))
    .pipe(gulp.dest('bin'))
    .pipe(rename('ejs.min.js'))
    .pipe(uglify())    
    .pipe(gulp.dest('bin'));
});

gulp.task('watch', function(){
    watch(['src/index.js', 'src/*/*.js'], function(){
        gulp.start('js');
    });
});
