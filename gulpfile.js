var gulp = require('gulp');
var rollup = require('rollup');
var babel = require('rollup-plugin-babel');
var nodeResolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');

function buildMain() {

  return rollup.rollup({
    entry: './src/js-mq.js',
    plugins: [
      nodeResolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**'
      })
    ]
  }).then((bundle) => {

    return Promise.all([
      bundle.write({
        format: 'es',
        moduleName: 'mq',
        dest: './dist/js-mq.es2015.js',
        sourceMap: true
      }),
      bundle.write({
        format: 'umd',
        moduleName: 'mq',
        dest: './dist/js-mq.js',
        sourceMap: true
      })
    ]);

  })

}

function buildDocs() {
  return rollup.rollup({
    entry: './docs/demo/demo.js',
    plugins: [
      nodeResolve(),
      commonjs(),
      babel()
    ]
  }).then((bundle) => {

    return bundle.write({
      format: 'iife',
      dest: './docs/demo/demo-es5.js',
      sourceMap: true
    });

  })
}

gulp.task('main', buildMain);
gulp.task('docs', buildDocs);

gulp.task('default', ['main', 'docs']);

gulp.task('watch', ['default'], () => {
  return gulp.watch('./src/*.js', ['main']);
});
