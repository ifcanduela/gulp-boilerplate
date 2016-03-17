var gulp = require("gulp");
var sass = require("gulp-sass");
var watch = require("gulp-watch");
var plumber = require("gulp-plumber");
var batch = require("gulp-batch");
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('autoprefixer');
var babel = require('gulp-babel');
var rename = require('gulp-rename');

var plumberConfig = {
    errorHandler: function (err) {
        console.log(err.toString());
        this.emit('end');
    }
};

var postCssConfig = [
    autoprefixer({
        browsers: ['last 2 versions']
    })
];

var babelConfig = {
    presets: [
        "es2015"
    ]
};

var renameCallback = function (path) {
    path.basename = path.basename.replace('.babel', '');
    return path;
};

//
// Run `gulp sass` to compile the SCSS files.
//
gulp.task("sass", function () {
    return gulp.src("./sass/styles.scss")
        .pipe(plumber(plumberConfig))
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(postcss(postCssConfig))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("./css/"));
});

//
// Run `gulp babel` to transpile EcmaScript 6 (2015) files in /js/src
//
gulp.task("babel", function () {
    return gulp.src("./js/src/**/app.babel.js")
        .pipe(plumber(plumberConfig))
        .pipe(babel(babelConfig))
        .pipe(rename(renameCallback))
        .pipe(gulp.dest("./js/"));
});

//
// Run `gulp watch` to automatically compile the SCSS
// files when one of them is modified.
// This command does not catch changes in files created
// after the command is issued.
//
gulp.task("watch", function () {
    watch("./**/*.scss", batch(function (events, done) {
        gulp.start("sass", done);
    }));

    watch("./js/src/**/*.js", batch(function (events, done) {
        gulp.start("babel", done);
    }));
});

gulp.task('default', ['sass', 'babel', 'watch']);
