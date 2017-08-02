# Gulp boilerplate

Compiles Less and Sass stylesheets and EcmaScript 2015 files.

## How do I g-?

Clone the repo, `cd` into it and run `npm install` or `yarn install`. Make sure you also have Gulp installed globally (`npm i -g gulp`).

## And then what sho-?

You put your ES2015 files in the `src/js` folder with a `.js` extension, your SASS/LessCSS/Stylus files in `src/css`. Choose a CSS preprocessor in `Gulpfile.js`. Then run `gulp`.

## But does it comp-?

The Gulpfile includes commands to compile the stylesheets (`gulp css`) and the
scripts (`gulp js`) separately, and the `gulp watch` command (or just `gulp`)
will run those two commands whenever a source file changes within the `src` folder.

## Can I change th-?

I'm sure you can.
