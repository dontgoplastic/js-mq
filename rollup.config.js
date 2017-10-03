import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/js-mq.js',
  output: {
    file: 'js-mq.js',
    format: 'es'
  },
  plugins: [
    resolve(),
    commonjs()
  ]
};
