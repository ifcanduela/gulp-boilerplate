# Gulp boilerplate

Compiles SASS and EcmaScript 2015 files.

## How do I g-?

Clone the repo, `cd` into it and run `npm install`. Make sure you also have Gulp installed globally (`npm i -g gulp`).

## And then what sh-?

You put your ES2015 files in the `js/src` folder with a `.babel.js` extension, and your SASS files in `sass`, with a `.scss` extension. The run

## But does it co-?

The Gulpfile includes commands to compile the stylesheets (`gulp sass`) and the
scripts (`gulp babel`) separately, and the `gulp watch` command (or just `gulp`) 
will run those two commands whenever a `.babel.js` or `.scss` file changes within
the `js/src` and `sass` folders, respectively.

## Can I change th-?

I'm sure you can.
