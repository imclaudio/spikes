var gulp = require('gulp'),
    sync = require('browser-sync'),
    plumber = require('gulp-plumber'),
    concat = require('gulp-concat');


gulp.task('js-concat', function(){
    gulp.src(['src/**/*.js','src/*.js'])
        .pipe(plumber())
        .pipe(concat('bundle.js', {newLine:';'}))
        .pipe(gulp.dest('dist/'))
        .pipe(plumber.stop())
});


gulp.task('watch', function(){
    gulp.watch(['src/**/*.js','src/*.js','dist/init.js'],['js-concat']).on('change', sync.reload);
});

gulp.task('start-server', function(){
    sync.init({
        server: {
            baseDir: './'
        }
    })
});

gulp.task('default', ['start-server','js-concat','watch']);
