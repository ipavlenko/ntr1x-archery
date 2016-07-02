var gulp = require('gulp');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var cleancss = require('gulp-clean-css');
var fileinclude = require('gulp-file-include');
var sourcemaps = require('gulp-sourcemaps');
var streamqueue  = require('streamqueue');

gulp.task('vendor-scripts', function() {
    return gulp.src([
        'web/assets/vendor/jquery/dist/jquery.min.js',
        'web/assets/vendor/bootstrap/dist/js/bootstrap.min.js',
        'web/assets/vendor/perfect-scrollbar/js/perfect-scrollbar.jquery.min.js',
        'web/assets/vendor/vue/dist/vue.js',
        'web/assets/vendor/vue-router/dist/vue-router.js',
        'web/assets/vendor/vue-resource/dist/vue-resource.js',
        'web/assets/vendor/vue-validator/dist/vue-validator.js',
        'web/assets/vendor/moment/min/moment.min.js',
        'web/assets/vendor/Sortable/Sortable.js',
        'web/assets/vendor/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
        'web/assets/vendor/bootstrap-tagsinput/dist/bootstrap-tagsinput.min.js',
        'web/assets/vendor/bootstrap-combobox/js/bootstrap-combobox.js',
        'web/assets/vendor/seiyria-bootstrap-slider/dist/bootstrap-slider.min.js',
        'web/assets/vendor/ckeditor/ckeditor.js',
        'web/assets/vendor/jsonpath-plus/lib/jsonpath.js',
    ])
        .pipe(sourcemaps.init())
        // .pipe(browserify())
        .pipe(concat('vendor.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('web/assets/dist/'))
})

gulp.task('vendor-styles', function() {
    return gulp.src([
        'web/assets/vendor/bootstrap/dist/css/bootstrap.min.css',
        'web/assets/vendor/bootstrap/dist/css/bootstrap-theme.min.css',
        'web/assets/vendor/perfect-scrollbar/css/perfect-scrollbar.min.css',
        'web/assets/vendor/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
        'web/assets/vendor/bootstrap-tagsinput/dist/bootstrap-tagsinput.css',
        'web/assets/vendor/bootstrap-combobox/css/bootstrap-combobox.css',
        'web/assets/vendor/seiyria-bootstrap-slider/dist/css/bootstrap-slider.min.css',
    ])
        .pipe(sourcemaps.init())
        .pipe(cleancss())
        .pipe(concat('vendor.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('web/assets/dist/'));
})

gulp.task('dev-scripts', function() {
    return streamqueue(
        { objectMode: true },
        gulp.src([ '../ntr1x-archery-core/src/**/*.js' ]),
        gulp.src([ '../ntr1x-archery-shell/src/**/*.js' ]),
        gulp.src([ '../ntr1x-archery-widgets/src/**/*.js' ]),
        gulp.src([ '../ntr1x-archery-landing/src/**/*.js' ])
    )
        .pipe(sourcemaps.init())
        // .pipe(browserify())
        .pipe(concat('app.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('web/assets/dist/'))
})

gulp.task('dev-styles', function() {
    return streamqueue(
        { objectMode: true },
        gulp.src([ '../ntr1x-archery-core/src/**/*.css' ]),
        gulp.src([ '../ntr1x-archery-shell/src/**/*.css' ]),
        gulp.src([ '../ntr1x-archery-widgets/src/**/*.css' ]),
        gulp.src([ '../ntr1x-archery-landing/src/**/*.css' ])
    )
        .pipe(sourcemaps.init())
        .pipe(cleancss())
        .pipe(concat('app.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('web/assets/dist/'));
})

gulp.task('dev-templates', function() {
    return streamqueue(
        { objectMode: true },
        gulp.src([ '../ntr1x-archery-core/src/**/*.htm' ]),
        gulp.src([ '../ntr1x-archery-shell/src/**/*.htm' ]),
        gulp.src([ '../ntr1x-archery-widgets/src/**/*.htm' ]),
        gulp.src([ '../ntr1x-archery-landing/src/**/*.htm' ])
    )
        .pipe(sourcemaps.init())
        .pipe(concat('app.htm'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('web/assets/dist/'));
})

gulp.task('build', function() {
    return gulp.src(['app/Resources/views-src/public.html.twig'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('app/Resources/views/'));
})

// gulp.task('default', [
//     'vendor-scripts',
//     'vendor-styles',
//     'scripts',
//     'styles',
//     'build-with-templates',
// ])

gulp.task('dev', [
    'vendor-scripts',
    'vendor-styles',
    'dev-scripts',
    'dev-styles',
    'dev-templates',
], function() {
    gulp.start('build')
})

gulp.task('dev-watch', function() {

    gulp.start('dev');

    gulp.watch('../ntr1x-archery-core/src/**/*.js', [ 'dev-scripts' ])
    gulp.watch('../ntr1x-archery-shell/src/**/*.js', [ 'dev-scripts' ])
    gulp.watch('../ntr1x-archery-landing/src/**/*.js', [ 'dev-scripts' ])
    gulp.watch('../ntr1x-archery-widgets/src/**/*.js', [ 'dev-scripts' ])

    gulp.watch('../ntr1x-archery-core/src/**/*.css', [ 'dev-styles' ])
    gulp.watch('../ntr1x-archery-shell/src/**/*.css', [ 'dev-styles' ])
    gulp.watch('../ntr1x-archery-landing/src/**/*.css', [ 'dev-styles' ])
    gulp.watch('../ntr1x-archery-widgets/src/**/*.css', [ 'dev-styles' ])

    gulp.watch('../ntr1x-archery-core/src/**/*.htm', [ 'dev-templates' ])
    gulp.watch('../ntr1x-archery-shell/src/**/*.htm', [ 'dev-templates' ])
    gulp.watch('../ntr1x-archery-landing/src/**/*.htm', [ 'dev-templates' ])
    gulp.watch('../ntr1x-archery-widgets/src/**/*.htm', [ 'dev-templates' ])

    gulp.watch('app/Resources/views-src/public.html.twig', [ 'build' ])
    gulp.watch('web/assets/dist/app.htm', [ 'build' ])
})
