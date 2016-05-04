var gulp = require('gulp');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var cleancss = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('scripts-controls', function() {
    gulp.src(['src/NTR1X/ControlsBundle/Resources/public/src/**/*.js'])
        .pipe(sourcemaps.init())
        // .pipe(browserify())
        .pipe(concat('scripts.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('src/NTR1X/ControlsBundle/Resources/public/dist/'))
})

gulp.task('styles-controls', function() {
    gulp.src(['src/NTR1X/ControlsBundle/Resources/public/src/**/*.css'])
        .pipe(sourcemaps.init())
        .pipe(cleancss())
        .pipe(concat('styles.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('src/NTR1X/ControlsBundle/Resources/public/dist/'));
})

gulp.task('templates-controls', function() {
    gulp.src(['src/NTR1X/ControlsBundle/Resources/public/src/**/*.htm'])
        .pipe(sourcemaps.init())
        .pipe(concat('templates.htm'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('src/NTR1X/ControlsBundle/Resources/public/dist/'));
})

gulp.task('scripts-layout', function() {
    gulp.src(['src/NTR1X/LayoutBundle/Resources/public/src/**/*.js'])
        .pipe(sourcemaps.init())
        // .pipe(browserify())
        .pipe(concat('scripts.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('src/NTR1X/LayoutBundle/Resources/public/dist/'))
})

gulp.task('styles-layout', function() {
    gulp.src(['src/NTR1X/LayoutBundle/Resources/public/src/**/*.css'])
        .pipe(sourcemaps.init())
        .pipe(cleancss())
        .pipe(concat('styles.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('src/NTR1X/LayoutBundle/Resources/public/dist/'));
})

gulp.task('templates-layout', function() {
    gulp.src(['src/NTR1X/LayoutBundle/Resources/public/src/**/*.htm'])
        .pipe(sourcemaps.init())
        .pipe(concat('templates.htm'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('src/NTR1X/LayoutBundle/Resources/public/dist/'));
})

gulp.task('scripts-default', function() {
    gulp.src(['src/NTR1X/DefaultBundle/Resources/public/src/**/*.js'])
        .pipe(sourcemaps.init())
        // .pipe(browserify())
        .pipe(concat('scripts.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('src/NTR1X/DefaultBundle/Resources/public/dist/'))
})

gulp.task('styles-default', function() {
    gulp.src(['src/NTR1X/DefaultBundle/Resources/public/src/**/*.css'])
        .pipe(sourcemaps.init())
        .pipe(cleancss())
        .pipe(concat('styles.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('src/NTR1X/DefaultBundle/Resources/public/dist/'));
})

gulp.task('templates-default', function() {
    gulp.src(['src/NTR1X/DefaultBundle/Resources/public/src/**/*.htm'])
        .pipe(sourcemaps.init())
        .pipe(concat('templates.htm'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('src/NTR1X/DefaultBundle/Resources/public/dist/'));
})

gulp.task('default', function() {

    gulp.run('scripts-controls');
    gulp.run('styles-controls');
    gulp.run('templates-controls');
    gulp.run('scripts-layout');
    gulp.run('styles-layout');
    gulp.run('templates-layout');
    gulp.run('scripts-default');
    gulp.run('styles-default');
    gulp.run('templates-default');
})

gulp.task('watch', function() {

    gulp.run('default');

    gulp.watch('src/NTR1X/ControlsBundle/Resources/public/src/**/*.js', function(event) {
        gulp.run('scripts-controls');
    })

    gulp.watch('src/NTR1X/ControlsBundle/Resources/public/src/**/*.css', function(event) {
        gulp.run('styles-controls');
    })

    gulp.watch('src/NTR1X/ControlsBundle/Resources/public/src/**/*.htm', function(event) {
        gulp.run('templates-controls');
    })

    gulp.watch('src/NTR1X/LayoutBundle/Resources/public/src/**/*.js', function(event) {
        gulp.run('scripts-layout');
    })

    gulp.watch('src/NTR1X/LayoutBundle/Resources/public/src/**/*.css', function(event) {
        gulp.run('styles-layout');
    })

    gulp.watch('src/NTR1X/LayoutBundle/Resources/public/src/**/*.htm', function(event) {
        gulp.run('templates-layout');
    })

    gulp.watch('src/NTR1X/DefaultBundle/Resources/public/src/**/*.js', function(event) {
        gulp.run('scripts-default');
    })

    gulp.watch('src/NTR1X/DefaultBundle/Resources/public/src/**/*.css', function(event) {
        gulp.run('styles-default');
    })

    gulp.watch('src/NTR1X/DefaultBundle/Resources/public/src/**/*.htm', function(event) {
        gulp.run('templates-default');
    })
})
