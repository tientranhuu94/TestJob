'use strict';

// Module for webserver and livereload
var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    browserify = require('gulp-browserify'),
    browserSync = require('browser-sync').create(),
    useref = require('gulp-useref'),
    cssnano = require('gulp-cssnano'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    del = require('del'),
    runSequence = require('run-sequence'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    concatCss = require('gulp-concat-css'),
    uglify = require('gulp-uglify');

// ************ SERVER ************
var express = require('express'),
    refresh = require('gulp-livereload'),
    livereloadport = 32547,
    serverport = 12569;

// Setup an express server (but not start)
var server = express();

// Use our 'dist' folder as rootfolder
server.use(express.static('./dist'));
server.all('*', function(req, res) {
    res.sendFile('index.html', {
        root: 'dist'
    });
});
// ************
// Clean old 'dist' directory
gulp.task('clean', function() {
    return del.sync('dist');
});

// ************ JS ************

var js_components = ['bower_components/jquery/dist/jquery.min.js', 'bower_components/angular/angular.min.js'];
// JSHint task to check error js code
gulp.task('lint', function() {
    return gulp.src('app/scripts/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Browserify task to build javascript file
gulp.task('browserify', function() {
    gulp.src(js_components)
        .pipe(concat('libs.min.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('scripts', function() {
    gulp.src('app/scripts/main.js')
        .pipe(browserify({
            debug: true
        }))
        .pipe(uglify())
        .pipe(concat('bundle.min.js'))

        .pipe(gulp.dest('dist/js'));
});
// ************

// ************ CSS ************
var css_components = ['bower_components/bootstrap/dist/css/*.min.css']
    // compile file '.sass' to '.css'
gulp.task('sass', function() {
    return gulp.src('app/assets/scss/**/*.scss')
        .pipe(sass())
        .pipe(concatCss('sass.css'))
        .pipe(gulp.dest('app/assets/css'))
});

//  Concat css from bower_components
gulp.task('css', function() {
    gulp.src(css_components)
        .pipe(concat('libs.min.css'))
        .pipe(gulp.dest('dist/css'));
});
// Styles task
gulp.task('styles', ['sass', 'css'], function() {
    return gulp.src('app/assets/css/**/*.css')
        .pipe(autoprefixer(['last 2 versions', '> 1%', 'ie 8']))
        .pipe(cssnano())
        .pipe(concatCss('bundle.min.css'))
        .pipe(gulp.dest('dist/css'));
});


// ************

// ************ ANOTHER ************
// Fonts task to copy font to dist/fonts
gulp.task('fonts', function() {
    return gulp.src('app/assets/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'));
});


// Images task to optimizing images
gulp.task('images', function() {
    return gulp.src('app/assets/images/**/*.+(png|jpg|gif|svg)')
        .pipe(cache(imagemin()))
        .pipe(gulp.dest('dist/images'));
});

// Views task to copy every file from 'views' to 'dist/views'
gulp.task('views', function() {
    gulp.src('app/index.html')
        .pipe(gulp.dest('dist'));
    gulp.src('app/views/**.*html')
        .pipe(gulp.dest('dist/views'));
});

// live-reloading web
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'dist'
        }
    })
});


// ************

gulp.task('watch', ['browserSync', 'lint'], function() {
    // Start server
    server.listen(serverport);
    // Start live reload
    refresh.listen(livereloadport);
    // file javascript change
    gulp.watch('app/scripts/main.js', ['lint', 'scripts']);
    // watch our css files
    gulp.watch(['app/assets/css/**/*.css', 'app/assets/scss/**/*.scss'], ['styles']);
    // watch our views files
    gulp.watch('app/**/*.html', ['views']);
    // watch our images files
    gulp.watch('app/assets/images/**', ['images']);

    // watch our dist
    gulp.watch('./dist/**', browserSync.reload)
});

gulp.task('build', ['clean'], function() {
    runSequence(['lint', 'sass', 'styles', 'fonts', 'images', 'browserify', 'scripts', 'views', ]);
});
// gulp command default
gulp.task('default', function(callback) {
    runSequence(['build', 'browserSync', 'watch'],
        callback
    )
});
