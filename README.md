# Gulp boilerplate

Compiles SASS and EcmaScript 2015 files.

## How do I g-?

Clone the repo, `cd` into it and run `npm install`. Make sure you also have Gulp installed globally (`npm i -g gulp`).

## And then what sh-?

You put your ES2015 files in the `js/src` folder with a `.js` extension, your SASS files in `scss` and LESS files in `less`, with `.scss` or `.less` extensions, respectively. Then run `gulp`.

## But does it co-?

The Gulpfile includes commands to compile the stylesheets (`gulp css`) and the
scripts (`gulp js`) separately, and the `gulp watch` command (or just `gulp`)
will run those two commands whenever a source file changes within the `js/src` and  `css` folders, respectively.

## Can I change th-?

I'm sure you can.
