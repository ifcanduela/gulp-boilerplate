//
// CONFIG
//

const CONFIG = {
    staticFiles: {
        './src/fonts': './fonts',
        './src/images': './images',
    },

    css: {
        // Choose a CSS preprocessor to generate stylesheets
        preprocessor: 'less',
        // preprocessor: 'sass',
        // preprocessor: 'stylus',

        // Change these settings to fit your paths and preprocessor of choice
        watchGlob: './src/css/**/*.less',
        inputFileNames: [
            './src/css/app.less',
        ],
        // Destination folder for compiled CSS files
        outputPath: './css/',
        // Set to false to disable Autoprefixer
        autoPrefixer: {},
        // Source maps are inlined by default
        sourceMaps: {},
    },

    js: {
        // Use Browserify to bundle JavaScript files.

        // watch source files
        watchGlob: './src/js/**/*.js',
        // Destination folder for compiled JS files
        outputPath: './js/',
        // Entry files for JavaScript compilation
        files: {
            './src/js/app.js': 'app.bundle.js'
        },
        // Babel configuration
        babel: {
            presets: ['env'],
        },
        // Browserify root paths (like the `opts.paths` command-line option)
        paths: [
        ],
        // JavaScript sourcemaps
        sourceMaps: {
            loadMaps: true,
        },
    },

    log: {
        // Choose whether to display a toast on error or not
        displayToast: true,
        // Log errors to the console
        // If the toasts are enabled, the gulp-notify plugin will automatically
        // log to the console, so this is better left disabled
        printToConsole: false,
    },

    // By default no minification is enabled
    // Using the `gulp prod` task enables minification of CSS and JS and disables
    // the sourcemaps
    production: false,
};

//
// MODULES
//

let autoprefixer = require('gulp-autoprefixer');
let babelify = require('babelify');
let batch = require('gulp-batch');
let browserify = require('browserify');
let buffer = require('vinyl-buffer');
let cleancss = require('gulp-clean-css');
let css = require('gulp-' + CONFIG.css.preprocessor);
let fs = require('fs');
let gulp = require('gulp');
let gulpif = require('gulp-if');
let notify = require('gulp-notify');
let path = require('path');
let plumber = require('gulp-plumber');
let rename = require('gulp-rename');
let source = require('vinyl-source-stream');
let sourcemaps = require('gulp-sourcemaps');
let uglify = require('gulp-uglify');
let watch = require('gulp-watch');

//
// HELPERS AND SETTINGS
//

let plumberConfig = {
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
// Run `gulp css` to compile the stylesheets.
//
gulp.task('css', () => {
    return gulp.src(CONFIG.css.inputFileNames)
        .pipe(plumber(plumberConfig))
        .pipe(gulpif(!CONFIG.production, sourcemaps.init(CONFIG.css.sourceMaps)))
        .pipe(css())
        .pipe(gulpif(CONFIG.css.autoPrefixer, autoprefixer(CONFIG.css.autoPrefixer)))
        .pipe(gulpif(CONFIG.production, cleancss()))
        .pipe(gulpif(!CONFIG.production, sourcemaps.write()))
        .pipe(gulp.dest(CONFIG.css.outputPath));
});

//
// Run `gulp js` to bundle the JavaScript files using Browserify and transpile
// them using Babel
//
gulp.task('js', () => {
    for (let inputFileName in CONFIG.js.files) {
        let outputFileName = CONFIG.js.files[inputFileName];

        if (!outputFileName) {
            outputFileName = path.basename(inputFileName);
        }

        let b = browserify({
            entries: inputFileName,
            paths: CONFIG.js.paths,
            debug: !CONFIG.production
        });

        b.transform(babelify, CONFIG.js.babel)
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
// Run `gulp copy` to recursively copy folders and files without
// further processing.
//
gulp.task('copy', () => {
    for (let sourceFolder in CONFIG.staticFiles) {
        let destinationFolder = CONFIG.staticFiles[sourceFolder];

        if (fs.existsSync(sourceFolder)) {
            console.log(`Copying ${sourceFolder} to ${destinationFolder}`);

            gulp
                .src([`${sourceFolder}/**/*`], {base: sourceFolder})
                .pipe(gulp.dest(destinationFolder));
        } else {
            console.log(`Folder ${sourceFolder} not found, skipped`);
        }
    }
});

//
// Run `gulp watch` to automatically compile the LESS, SASS and JS
// files when one of them is modified.
//
gulp.task('watch', () => {
    watch(CONFIG.css.watchGlob, batch((events, done) => {
        gulp.start('css', done);
    }));

    watch(CONFIG.js.watchGlob, batch((events, done) => {
        gulp.start('js', done);
    }));
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
    'copy',
    'watch'
]);
