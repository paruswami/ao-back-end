'use strict';

const JS_FILES = ['app.js', 'controllers/**/*.js', 'models/**/*.js', 'routes/**/*.js', 'helpers/**/*.js'];

const gulp = require('gulp'),
    eslint = require('gulp-eslint'),
    nodemon = require('gulp-nodemon'),
    prettify = require('gulp-jsbeautifier');

let pending = false;

gulp.task('watch', () => {
    gulp.watch(JS_FILES, { debounceDelay: 200 }, (ev) => {
        if ((ev.type === 'added' || ev.type === 'changed') && !pending) {
            conditionJS(ev.path);
        }
    });
});

gulp.task('start', () => {
    let stream = nodemon({
        script: 'app.js',
        ext: 'js',
        ignore: 'gulpfile.js',
        env: { 'NODE_ENV': 'development' }
    });

    stream.on('crash', () => {
        stream.emit('restart', 5);
    });
});

function conditionJS(file) {
    pending = true;

    new Promise((resolve) => {
        new Promise((resolve) => {
            gulp.src(file, { base: './' })
                .pipe(prettify())
                .pipe(gulp.dest('./'))
                .on('end', resolve);
        }).then(() => {
            gulp.src(file, { base: './' })
                .pipe(eslint({ fix: true }))
                .pipe(eslint.format())
                .pipe(gulp.dest('./'))
                .on('end', resolve);
        });
    }).then(() => {
        setTimeout(() => {
            pending = false;
        }, 200);
    });
}

gulp.task('dev', ['start', 'watch'], () => {
    conditionJS(JS_FILES);
});
