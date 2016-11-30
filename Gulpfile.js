//
// CONFIG
//

// Select the CSS preprocessor to use
// Available options are 'less', 'sass'; other values
// will disable CSS preprocessing
const CSS_PREPROCESSOR = 'less';

// Use Browserify to bundle JavaScript files
const COMPILE_JS = true;

const JS_WATCH_GLOB = './js/src/**/*.js';
const MAIN_JS_FILE = './js/src/app.js';
const JS_OUTPUT_PATH = './js/';
const JS_OUTPUT_FILENAME = 'app.bundle.js';

const LESS_WATCH_GLOB = './less/**/*.less';
const SASS_WATCH_GLOB = './scss/**/*.scss';

const MAIN_LESS_FILE = './less/main.less';
const MAIN_SASS_FILE = './scss/main.scss';

const CSS_OUTPUT_PATH = './css/';
const CSS_OUTPUT_FILENAME = 'styles.css';

// Choose whether to display a toast on error or not
const USE_NOTIFIER_TOASTS = true;

// Log errors to the console.
// If the toasts are enabled the gulp-notify plugin will automatically log
// to the console, so this is better disabled.
const LOG_ERRORS_TO_CONSOLE = !USE_NOTIFIER_TOASTS;

// By default no minification is enabled. Using the `gulp prod` task enables
// minification of CSS and JS and disables the sourcemaps.
let PRODUCTION = false;

//
// MODULES
//

let autoprefixer = require('gulp-autoprefixer');
let babel = require('gulp-babel');
let batch = require('gulp-batch');
let browserify = require('browserify');
let buffer = require('vinyl-buffer');
let gulp = require('gulp');
let gulpif = require('gulp-if');
let less = require('gulp-less');
let minifycss = require('gulp-minify-css');
let notify = require('gulp-notify');
let plumber = require('gulp-plumber');
let rename = require('gulp-rename');
let sass = require('gulp-sass');
let source = require('vinyl-source-stream');
let sourcemaps = require('gulp-sourcemaps');
let uglify = require('gulp-uglify');
let watch = require('gulp-watch');

//
// HELPERS AND SETTINGS
//

let babelConfig = {presets: ['es2015']};

let plumberConfig = {
    errorHandler: function (err) {
        if (LOG_ERRORS_TO_CONSOLE) {
            console.log(err.toString());
        }

        if (USE_NOTIFIER_TOASTS) {
            notify.onError({
                title: 'Gulp',
                subtitle: 'Task error',
                message: "<%= error.annotated ? error.annotated : error.message %>",
                sound: 'Beep'
            }) (err);
        }

        this.emit('end');
    }
};

//
// TASKS
//

//
// Run `gulp less` to compile the LessCSS files.
//
gulp.task('less', () => {
    return gulp.src(MAIN_LESS_FILE)
        .pipe(plumber(plumberConfig))
        .pipe(gulpif(!PRODUCTION, sourcemaps.init()))
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(gulpif(PRODUCTION, minifycss()))
        .pipe(gulpif(!PRODUCTION, sourcemaps.write()))
        .pipe(rename(CSS_OUTPUT_FILENAME))
        .pipe(gulp.dest(CSS_OUTPUT_PATH));
});

//
// Run `gulp sass` to compile the SCSS files.
//
gulp.task('sass', () => {
    return gulp.src(MAIN_SASS_FILE)
        .pipe(plumber(plumberConfig))
        .pipe(gulpif(!PRODUCTION, sourcemaps.init()))
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(gulpif(PRODUCTION, minifycss()))
        .pipe(gulpif(!PRODUCTION, sourcemaps.write()))
        .pipe(rename(CSS_OUTPUT_FILENAME))
        .pipe(gulp.dest(CSS_OUTPUT_PATH));
});

//
// Run `gulp css` to compile the stylesheets using the configured preprocessor.
//
gulp.task('css', () => {
    if (CSS_PREPROCESSOR === 'less') {
        gulp.start('less');
    }

    if (CSS_PREPROCESSOR === 'sass') {
        gulp.start('sass');
    }
});

//
// Run `gulp js` to bundle the JavaScript files using Browserify and transpile
// them using Babel
//
gulp.task('js', () => {
    let b = browserify({
        entries: MAIN_JS_FILE,
        debug: PRODUCTION
    });

    return b.bundle()
        .on('error', plumberConfig.errorHandler)
        .pipe(plumber(plumberConfig))
        .pipe(source(JS_OUTPUT_FILENAME))
        .pipe(buffer())
        .pipe(gulpif(!PRODUCTION, sourcemaps.init({loadMaps: true})))
        .pipe(babel(babelConfig))
        .pipe(gulpif(PRODUCTION, uglify()))
        .pipe(gulpif(!PRODUCTION, sourcemaps.write()))
        .pipe(gulp.dest(JS_OUTPUT_PATH));
});

//
// Run `gulp watch` to automatically compile the LESS, SASS and JS
// files when one of them is modified.
//
gulp.task('watch', () => {
    if (CSS_PREPROCESSOR === 'sass') {
        watch(SASS_WATCH_GLOB, batch((events, done) => {
            gulp.start('sass', done);
        }));
    }

    if (CSS_PREPROCESSOR === 'less') {
        watch(LESS_WATCH_GLOB, batch((events, done) => {
            gulp.start('less', done);
        }));
    }

    if (COMPILE_JS) {
        watch(JS_WATCH_GLOB, batch((events, done) => {
            gulp.start('js', done);
        }));
    }
});

//
// Run `gulp prod` to compile the LESS/SASS and JS files with
// minification enabled.
//
gulp.task('prod', () => {
    PRODUCTION = true;

    if (CSS_PREPROCESSOR === 'sass') {
        gulp.start('sass');
    }

    if (CSS_PREPROCESSOR === 'less') {
        gulp.start('less');
    }

    if (COMPILE_JS) {
        gulp.start('js');
    }
});

gulp.task('default', [
    'css',
    'js',
    'watch'
]);
