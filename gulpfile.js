'use strict';

var gulp = require('gulp');

gulp.task('clean', function (cb) {
    require('rimraf')('dist', cb);
});

gulp.task('lint', function () {
    var jshint = require('gulp-jshint');

    return gulp.src('app/scripts/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('styles', function () {
    var sass = require('gulp-sass'),
        sourcemaps = require('gulp-sourcemaps');

    return gulp.src('app/styles/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            precision: 10
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('app/styles'));
});

gulp.task('images', function () {
    var cache = require('gulp-cache'),
        imagemin = require('gulp-imagemin');

    return gulp.src('app/images/**/*')
        .pipe(cache(imagemin({
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function () {
    return gulp.src('app/styles/fonts/*')
        .pipe(gulp.dest('dist/styles/fonts'));
});

gulp.task('misc', function () {
    return gulp.src([
            'app/*.{ico,png,txt}',
            'app/.htaccess'
        ])
        .pipe(gulp.dest('dist'));
});

gulp.task('html', ['styles'], function () {
    var htmlclean = require('gulp-remove-html-comments'),
        useref = require('gulp-useref'),
        gulpif = require('gulp-if'),
        assets = useref.assets();

    return gulp.src('app/**/*.html')
        .pipe(assets)
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(htmlclean())
        .pipe(gulp.dest('dist'));
});

gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;
    gulp.src('app/styles/*.scss')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app/styles'));
    gulp.src('app/**/*.html')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app'));
});

gulp.task('connect', function () {
    var connect = require('connect');
    var serveStatic = require('serve-static');
    var serveIndex = require('serve-index');
    var app = connect()
        .use(require('connect-livereload')({ port: 35729 }))
        .use(serveStatic('app'))
        .use(serveIndex('app'));

    require('http').createServer(app)
        .listen(9000)
        .on('listening', function() {
            console.log('Started connect web server on http://localhost:9000.');
        });
});

gulp.task('serve', ['styles', 'connect'], function () {
    var livereload = require('gulp-livereload');

    livereload.listen();

    require('opn')('http://localhost:9000');

    gulp.watch([
        'app/**/*.html',
        'app/styles/**/*.css',
        'app/scripts/**/*.js',
        'app/images/**/*'
    ]).on('change', livereload.changed);

    gulp.watch('app/styles/**/*.scss', ['styles']);
    gulp.watch('bower.json', ['wiredep']);
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'misc']);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});
