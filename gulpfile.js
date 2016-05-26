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
        .pipe(gulp.dest('src/NTR1X/DefaultBundle/Resources/public/dist/'));
    gulp.src(['src/NTR1X/MgaBundle/Resources/public/src/**/*.js'])
        .pipe(sourcemaps.init())
        // .pipe(browserify())
        .pipe(concat('scripts.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('src/NTR1X/MgaBundle/Resources/public/dist/'));
})

gulp.task('styles-default', function() {
    gulp.src(['src/NTR1X/DefaultBundle/Resources/public/src/**/*.css'])
        .pipe(sourcemaps.init())
        .pipe(cleancss())
        .pipe(concat('styles.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('src/NTR1X/DefaultBundle/Resources/public/dist/'));
    gulp.src(['src/NTR1X/MgaBundle/Resources/public/src/**/*.css'])
        .pipe(sourcemaps.init())
        .pipe(cleancss())
        .pipe(concat('styles.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('src/NTR1X/MgaBundle/Resources/public/dist/'));
})

gulp.task('templates-default', function() {
    gulp.src(['src/NTR1X/DefaultBundle/Resources/public/src/**/*.htm'])
        .pipe(sourcemaps.init())
        .pipe(concat('templates.htm'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('src/NTR1X/DefaultBundle/Resources/public/dist/'));
    gulp.src(['src/NTR1X/MgaBundle/Resources/public/src/**/*.htm'])
        .pipe(sourcemaps.init())
        .pipe(concat('templates.htm'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('src/NTR1X/MgaBundle/Resources/public/dist/'));
})

gulp.task('default', function() {

    gulp.start('scripts-controls');
    gulp.start('styles-controls');
    gulp.start('templates-controls');
    gulp.start('scripts-layout');
    gulp.start('styles-layout');
    gulp.start('templates-layout');
    gulp.start('scripts-default');
    gulp.start('styles-default');
    gulp.start('templates-default');
})

gulp.task('watch', function() {

    gulp.start('default');

    gulp.watch('src/NTR1X/ControlsBundle/Resources/public/src/**/*.js', [ 'scripts-controls' ])
    gulp.watch('src/NTR1X/ControlsBundle/Resources/public/src/**/*.css', [ 'styles-controls' ])
    gulp.watch('src/NTR1X/ControlsBundle/Resources/public/src/**/*.htm', [ 'templates-controls' ])
    gulp.watch('src/NTR1X/LayoutBundle/Resources/public/src/**/*.js', [ 'scripts-layout' ])
    gulp.watch('src/NTR1X/LayoutBundle/Resources/public/src/**/*.css', [ 'styles-layout' ])
    gulp.watch('src/NTR1X/LayoutBundle/Resources/public/src/**/*.htm', [ 'templates-layout' ])
    gulp.watch('src/NTR1X/DefaultBundle/Resources/public/src/**/*.js', [ 'scripts-default' ])
    gulp.watch('src/NTR1X/DefaultBundle/Resources/public/src/**/*.css', [ 'styles-default' ])
    gulp.watch('src/NTR1X/DefaultBundle/Resources/public/src/**/*.htm', [ 'templates-default' ])
    gulp.watch('src/NTR1X/MgaBundle/Resources/public/src/**/*.js', [ 'scripts-default' ])
    gulp.watch('src/NTR1X/MgaBundle/Resources/public/src/**/*.css', [ 'styles-default' ])
    gulp.watch('src/NTR1X/MgaBundle/Resources/public/src/**/*.htm', [ 'templates-default' ])
})
