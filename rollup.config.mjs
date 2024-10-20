import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import image from '@rollup/plugin-image';
import url from '@rollup/plugin-url';
import svgr from '@svgr/rollup';
import pkg from './package.json' assert { type: 'json' };
import postcssImport from 'postcss-import';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      browser: true,
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    commonjs(),
    typescript({
      useTsconfigDeclarationDir: true,
      tsconfig: './tsconfig.json',
      clean: true,
    }),
    postcss({
      extensions: ['.css'],
      extract: 'styles.css',
      minimize: true,
      modules: false,
      plugins: [
        postcssImport(),
      ],
    }),
    image(),
    url({
      include: ['**/*.woff', '**/*.ttf', '**/*.eot'],
      limit: 8192,
    }),
    svgr(),
  ],
  external: [
    'react',
    'react-dom',
    'react-konva',
    'konva'
  ],
};
