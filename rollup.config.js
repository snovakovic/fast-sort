import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';
import copy from 'rollup-plugin-copy'
import pkg from './package.json';

export default {
  input: 'src/sort.ts',
  output: [
    {
      file: 'dist/sort.js',
      format: 'umd',
      name: 'fast-sort',
    },
    {
      file: 'dist/sort.min.js',
      format: 'umd',
      name: 'fast-sort',
      plugins: [uglify({})],
    },
    {
      // sort.es.js
      file: pkg.module,
      format: 'es',
    },
  ],
  plugins: [
    typescript({
      // eslint-disable-next-line global-require
      typescript: require('typescript'),
    }),
    copy({
      hook: 'writeBundle',
      targets: [{
        src: 'dist/sort.d.ts',
        dest: 'dist',
        rename: 'sort.min.d.ts',
      }]
    })
  ],
};
