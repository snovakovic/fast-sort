import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';
import pkg from './package.json';

export default {
  input: 'src/sort.ts',
  output: [
    {
      // sort.js
      file: pkg.main,
      format: 'cjs',
    },
    {
      // sort.min.js
      file: pkg.main.replace('.js', '.min.js'),
      format: 'cjs',
      plugins: [uglify()],
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
  ],
};
