import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';
import copy from 'rollup-plugin-copy';
import pkg from './package.json';

export default {
  input: 'src/sort.ts',
  output: [
    {
      file: 'dist/sort.js',
      format: 'umd',
      name: 'fastSort',
    },
    {
      file: 'dist/sort.min.js',
      format: 'umd',
      name: 'fastSort',
      plugins: [uglify({})],
    },
    {
      file: pkg.module, // "dist/sort.esm.js"
      format: 'esm',
    },
    {
      file: pkg.main, // "dist/sort.cjs.js"
      format: 'cjs',
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
      }],
    }),
  ],
};
