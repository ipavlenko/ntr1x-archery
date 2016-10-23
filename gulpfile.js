var gulp = require('gulp');
var concat = require('gulp-concat');
var cleancss = require('gulp-clean-css');
var fileinclude = require('gulp-file-include');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var streamqueue = require('streamqueue');
var gulpif = require('gulp-if');
var lib = require('bower-files')();

var debug = false;

gulp.task('vendor-scripts', function(cb) {
    gulp.src(lib.ext('js').files)
        .pipe(sourcemaps.init())
        .pipe(concat('vendor.js'))
        .pipe(gulpif(!debug, uglify()))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('web/assets/dist/js/'))
        .on('end', cb)
    ;
})

gulp.task('vendor-styles', function(cb) {
    gulp.src(lib.ext('css').files)
        .pipe(sourcemaps.init())
        .pipe(cleancss())
        .pipe(concat('vendor.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('web/assets/dist/css/'))
        .on('end', cb)
    ;
})

gulp.task('vendor-fonts', function(cb) {
    gulp.src([
        'web/assets/vendor/bootstrap/dist/fonts/**/*',
        'web/assets/vendor/font-awesome/fonts/**/*'
    ])
        .pipe(gulp.dest('web/assets/dist/fonts/'))
        .on('end', cb)
    ;
})

gulp.task('dev-scripts', function(cb) {
    streamqueue(
        { objectMode: true },
        gulp.src([ '../ntr1x-archery-core/src/**/*.js' ]),
        gulp.src([ '../ntr1x-archery-shell/src/**/*.js' ]),
        gulp.src([ '../ntr1x-archery-widgets/src/**/*.js' ]),
        gulp.src([ '../ntr1x-archery-landing/src/**/*.js' ]),
        gulp.src([ '../ntr1x-archery-widgets-academy/src/**/*.js' ])
    )
        .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(babel())
        .pipe(gulpif(!debug, uglify()))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('web/assets/dist/js/'))
        .on('end', cb)
})

gulp.task('dev-styles', function(cb) {
    streamqueue(
        { objectMode: true },
        gulp.src([ '../ntr1x-archery-core/src/**/*.css' ]),
        gulp.src([ '../ntr1x-archery-shell/src/**/*.css' ]),
        gulp.src([ '../ntr1x-archery-widgets/src/**/*.css' ]),
        gulp.src([ '../ntr1x-archery-landing/src/**/*.css' ]),
        gulp.src([ '../ntr1x-archery-widgets-academy/src/**/*.css' ])
    )
        .pipe(sourcemaps.init())
        .pipe(cleancss())
        .pipe(concat('app.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('web/assets/dist/css/'))
        .on('end', cb)
    ;
})

gulp.task('dev-templates', function(cb) {
    streamqueue(
        { objectMode: true },
        gulp.src([ '../ntr1x-archery-core/src/**/*.htm' ]),
        gulp.src([ '../ntr1x-archery-shell/src/**/*.htm' ]),
        gulp.src([ '../ntr1x-archery-widgets/src/**/*.htm' ]),
        gulp.src([ '../ntr1x-archery-landing/src/**/*.htm' ]),
        gulp.src([ '../ntr1x-archery-widgets-academy/src/**/*.htm' ])
    )
        .pipe(sourcemaps.init())
        .pipe(concat('app.htm'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('web/assets/dist/htm/'))
        .on('end', cb)
    ;
})

gulp.task('dev-images', function(cb) {
    streamqueue(
        { objectMode: true },
        gulp.src([ '../ntr1x-archery-core/src/**/*.{jpg,png}' ]).pipe(gulp.dest('web/assets/vendor/ntr1x-archery-core/src/')),
        gulp.src([ '../ntr1x-archery-shell/src/**/*.{jpg,png}' ]).pipe(gulp.dest('web/assets/vendor/ntr1x-archery-shell/src/')),
        gulp.src([ '../ntr1x-archery-widgets/src/**/*.{jpg,png}' ]).pipe(gulp.dest('web/assets/vendor/ntr1x-archery-widgets/src/')),
        gulp.src([ '../ntr1x-archery-landing/src/**/*.{jpg,png}' ]).pipe(gulp.dest('web/assets/vendor/ntr1x-archery-landing/src/')),
        gulp.src([ '../ntr1x-archery-widgets-academy/src/**/*.{jpg,png}' ]).pipe(gulp.dest('web/assets/vendor/ntr1x-archery-widgets-academy/src/'))
    )
        .on('end', cb)
    ;
})

gulp.task('build', function(cb) {

    gulp
        .src([
            'app/Resources/views-src/designer.html.twig',
            'app/Resources/views-src/landing.html.twig'
        ])
        .pipe(fileinclude({ prefix: '@@', basepath: '@file' }))
        .pipe(gulp.dest('app/Resources/views/'))
        .on('end', cb)
    ;

    // streamqueue(
    //     { objectMode: true },
    //     // gulp.src(['app/Resources/views-src/landing.html.twig']).pipe(fileinclude({ prefix: '@@', basepath: '@file' })).pipe(gulp.dest('app/Resources/views/')),
    //
    // )
    //     .on('end', cb)
    // ;
})

gulp.task('default', [
    'vendor-scripts',
    'vendor-styles',
    'vendor-fonts',
    'dev-scripts',
    'dev-styles',
    'dev-templates',
    'dev-images',
], function(cb) {
    gulp.start('build')
})

gulp.task('watch', function() {

    debug = true;

    gulp.start('default');

    gulp.watch('../ntr1x-archery-core/src/**/*.js', [ 'dev-scripts' ])
    gulp.watch('../ntr1x-archery-shell/src/**/*.js', [ 'dev-scripts' ])
    gulp.watch('../ntr1x-archery-landing/src/**/*.js', [ 'dev-scripts' ])
    gulp.watch('../ntr1x-archery-widgets/src/**/*.js', [ 'dev-scripts' ])
    gulp.watch('../ntr1x-archery-widgets-academy/src/**/*.js', [ 'dev-scripts' ])

    gulp.watch('../ntr1x-archery-core/src/**/*.css', [ 'dev-styles' ])
    gulp.watch('../ntr1x-archery-shell/src/**/*.css', [ 'dev-styles' ])
    gulp.watch('../ntr1x-archery-landing/src/**/*.css', [ 'dev-styles' ])
    gulp.watch('../ntr1x-archery-widgets/src/**/*.css', [ 'dev-styles' ])
    gulp.watch('../ntr1x-archery-widgets-academy/src/**/*.css', [ 'dev-styles' ])

    gulp.watch('../ntr1x-archery-core/src/**/*.htm', [ 'dev-templates' ])
    gulp.watch('../ntr1x-archery-shell/src/**/*.htm', [ 'dev-templates' ])
    gulp.watch('../ntr1x-archery-landing/src/**/*.htm', [ 'dev-templates' ])
    gulp.watch('../ntr1x-archery-widgets/src/**/*.htm', [ 'dev-templates' ])
    gulp.watch('../ntr1x-archery-widgets-academy/src/**/*.htm', [ 'dev-templates' ])

    gulp.watch('../ntr1x-archery-core/src/**/*.{jpg,png}', [ 'dev-images' ])
    gulp.watch('../ntr1x-archery-shell/src/**/*.{jpg,png}', [ 'dev-images' ])
    gulp.watch('../ntr1x-archery-landing/src/**/*.{jpg,png}', [ 'dev-images' ])
    gulp.watch('../ntr1x-archery-widgets/src/**/*.{jpg,png}', [ 'dev-images' ])
    gulp.watch('../ntr1x-archery-widgets-academy/src/**/*.{jpg,png}', [ 'dev-images' ])

    gulp.watch('app/Resources/views-src/landing.html.twig', [ 'build' ])
    gulp.watch('app/Resources/views-src/designer.html.twig', [ 'build' ])
    gulp.watch('web/assets/dist/htm/app.htm', [ 'build' ])
})
