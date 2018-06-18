/**
 * HOW TO USE:
 *
 * This gulpfile is setup to compile JS files and stylesheets from a `src` folder.
 *
 * Running `gulp` will start a file watcher that compiles assets in development mode,
 * withouth minification and with source maps.
 *
 * Running `gulp prod` will remove the source maps and minify CSS and JavaScript files.
 * 
 * STYLESHEETS:
 *
 * Place your Sass, Less or Stylus files in `src/css`. Add main files to the 
 * `CONFIG.css.inputFileNames` array.
 *
 * To select a preprocessor, scroll down to the list of `require` calls and change
 * `const css = require("gulp-less")`  to the plugin of your choice. Be sure it was
 * installed first.
 *
 * SCRIPTS:
 *
 * Place entry points in the `src/js` folder. By default, every `.js` file in that
 * folder will be compiled separately. If don't want that, remove the `CONFIG.js.filesGlob`
 * setting and update the `CONFIG.js.files` map. If you don't provide a value, the destination
 * file will have the same name as the source file.
 * 
 */

//
// CONFIG
//

const CONFIG = {
    staticFiles: {
        "./src/fonts": "./fonts",
        "./src/images": "./images",
    },

    css: {
        // Change these settings to fit your paths and preprocessor of choice
        watchGlob: "./src/css/**/*.less",
        inputFileNames: [
            "./src/css/app.less",
        ],
        // Destination folder for compiled CSS files
        outputPath: "./css/",
        // Set to false to disable Autoprefixer
        autoPrefixer: {},
        // Source maps are inlined by default
        sourceMaps: {},
    },

    js: {
        // Use Browserify to bundle JavaScript files.

        // watch source files
        watchGlob: "./src/js/**/*.js",
        // Destination folder for compiled JS files
        outputPath: "./js/",
        // Entry files for JavaScript compilation
        files: {
            // "./src/js/app.js": "app.bundle.js"
        },
        // Generic pattern of files to compile
        filesGlob: "./src/js/*.js",
        // Babel configuration
        babel: {
            presets: ["env"],
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

const autoprefixer = require("gulp-autoprefixer");
const babelify = require("babelify");
const batch = require("gulp-batch");
const browserify = require("browserify");
const buffer = require("vinyl-buffer");
const cleancss = require("gulp-clean-css");
const css = require("gulp-less");
const fs = require("fs");
const glob = require("glob")
const gulp = require("gulp");
const gulpif = require("gulp-if");
const notify = require("gulp-notify");
const path = require("path");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const source = require("vinyl-source-stream");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
const watch = require("gulp-watch");

//
// HELPERS AND SETTINGS
//

const plumberConfig = {
    errorHandler: function (err) {
        if (CONFIG.log.printToConsole) {
            console.log(err.toString());
        }

        if (CONFIG.log.displayToast) {
            notify.onError({
                title: "Gulp",
                subtitle: "Task error",
                message: "<%= error.annotated ? error.annotated : error.message %>",
                sound: "Beep"
            }) (err);
        }

        this.emit("end");
    }
};

//
// TASKS
//

//
// Run `gulp css` to compile the stylesheets.
//
gulp.task("css", () => {
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
gulp.task("js", () => {
    let files = CONFIG.js.files;

    if (CONFIG.js.filesGlob) {
        glob.sync(CONFIG.js.filesGlob).forEach(f => {
            files[f] = null;
        });
    }

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
gulp.task("copy", () => {
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
gulp.task("watch", () => {
    watch(CONFIG.css.watchGlob, batch((events, done) => {
        gulp.start("css", done);
    }));

    watch(CONFIG.js.watchGlob, batch((events, done) => {
        gulp.start("js", done);
    }));
});

//
// Run `gulp prod` to compile the LESS/SASS and JS files with
// minification enabled.
//
gulp.task("prod", () => {
    CONFIG.production = true;

    gulp.start("css");
    gulp.start("js");
    gulp.start("copy");
});

gulp.task("default", [
    "css",
    "js",
    "copy",
    "watch",
]);
