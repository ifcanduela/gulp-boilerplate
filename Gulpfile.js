//
// CONFIG
//

var CONFIG = {
    css: {
        // Select which CSS preprocessor to use (less/sass/stylus)
        // Set to false to skip CSS compilation
        preprocessor: 'less',

        outputPath: './css/',
        outputFileName: 'styles.css',

        // Set to false to disable Autoprefixer
        autoPrefixer: {},

        sourceMaps: {},
    },

    js: {
        compile: true,

        // Use Browserify to bundle JavaScript files
        // Set to false to skip JavaScript processing
        watchGlob: './js/src/**/*.js',
        outputPath: './js/',
        // mainFile: './js/src/app.js',
        // outputFileName: 'app.bundle.js',
        files: {
            './js/src/app.js': 'app.bundle.js'
        },

        babel: {
            presets: ['env'],
        },

        sourceMaps: {
            loadMaps: true,
        },
    },

    less: {
        watchGlob: './less/**/*.less',
        mainFile: './less/main.less',
    },

    sass: {
        watchGlob: './scss/**/*.scss',
        mainFile: './scss/main.scss',
    },

    stylus: {
        watchGlob: './stylus/**/*.styl',
        mainFile: './stylus/main.styl',
    },

    log: {
        // Choose whether to display a toast on error or not
        displayToast: true,
        // Log errors to the console.
        // If the toasts are enabled the gulp-notify plugin will automatically log
        // to the console, so this is better disabled.
        printToConsole: false,
    },

    // By default no minification is enabled. Using the `gulp prod` task enables
    // minification of CSS and JS and disables the sourcemaps.
    production: false,
};

//
// MODULES
//

var autoprefixer = require('gulp-autoprefixer');
var babelify = require('babelify');
var batch = require('gulp-batch');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var cleancss = require('gulp-clean-css');
var css = false;
var gulp = require('gulp');
var gulpif = require('gulp-if');
var notify = require('gulp-notify');
var path = require('path');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');

switch (CONFIG.css.preprocessor) {
    case 'less':
        css = require('gulp-less');
        break;
    case 'sass':
        css = require('gulp-sass');
        break;
    case 'stylus':
        css = require('gulp-stylus');
        break;
}

//
// HELPERS AND SETTINGS
//

var plumberConfig = {
    errorHandler: function (err) {
        if (CONFIG.log.printToConsole) {
            console.log(err.toString());
        }

        if (CONFIG.log.displayToast) {
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
// Run `gulp css` to compile the stylesheets using the configured preprocessor.
//
gulp.task('css', () => {
    if (css) {
        let preprocessor = CONFIG[CONFIG.css.preprocessor];

        return gulp.src(preprocessor.mainFile)
            .pipe(plumber(plumberConfig))
            .pipe(gulpif(!CONFIG.production, sourcemaps.init(CONFIG.css.sourceMaps)))
            .pipe(css())
            .pipe(gulpif(CONFIG.css.autoPrefixer, autoprefixer(CONFIG.css.autoPrefixer)))
            .pipe(gulpif(CONFIG.production, cleancss()))
            .pipe(gulpif(!CONFIG.production, sourcemaps.write()))
            .pipe(rename(CONFIG.css.outputFileName))
            .pipe(gulp.dest(CONFIG.css.outputPath));
    }
});

//
// Run `gulp js` to bundle the JavaScript files using Browserify and transpile
// them using Babel
//
gulp.task('js', () => {
    if (!CONFIG.js.compile) {
        return;
    }

    for (let inputFileName in CONFIG.js.files) {
        let outputFileName = CONFIG.js.files[inputFileName];

        if (!outputFileName) {
            outputFileName = path.basename(inputFileName);
        }

        let b = browserify({
            entries: inputFileName,
            debug: !CONFIG.production
        });

        b.transform(babelify, {presets: ["env"]})
            .bundle()
            .on('error', plumberConfig.errorHandler)
            .pipe(plumber(plumberConfig))
            .pipe(source(outputFileName))
            .pipe(buffer())
            .pipe(gulpif(!CONFIG.production, sourcemaps.init(CONFIG.js.sourceMaps)))
            .pipe(gulpif(CONFIG.production, uglify()))
            .pipe(gulpif(!CONFIG.production, sourcemaps.write()))
            .pipe(gulp.dest(CONFIG.js.outputPath));
    }
});

//
// Run `gulp watch` to automatically compile the LESS, SASS and JS
// files when one of them is modified.
//
gulp.task('watch', () => {
    if (css) {
        let preprocessor = CONFIG[CONFIG.css.preprocessor];

        watch(preprocessor.watchGlob, batch((events, done) => {
            gulp.start('css', done);
        }));
    }

    if (CONFIG.js.compile) {
        watch(CONFIG.js.watchGlob, batch((events, done) => {
            gulp.start('js', done);
        }));
    }
});

//
// Run `gulp prod` to compile the LESS/SASS and JS files with
// minification enabled.
//
gulp.task('prod', () => {
    CONFIG.production = true;

    gulp.start('css');
    gulp.start('js');
});

gulp.task('default', [
    'css',
    'js',
    'watch'
]);
