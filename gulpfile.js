var gulp = require('gulp');
var rollup = require('rollup');
var babel = require('rollup-plugin-babel');
var nodeResolve = require('rollup-plugin-node-resolve');


function build() {

  return rollup.rollup({
    entry: './src/mq-on.js',
    plugins: [
      nodeResolve({
        skip: 'underscore'
      }),
      babel({
        exclude: 'node_modules/**'
      })
    ]
  }).then((bundle) => {

    return bundle.write({
      format: 'iife',
      moduleName: 'mq',
      dest: './js-mq.js',
      sourceMap: true
    });

  })

}

gulp.task('default', build);