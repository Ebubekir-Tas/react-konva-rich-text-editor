import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import image from '@rollup/plugin-image';
import url from '@rollup/plugin-url';
import svgr from '@svgr/rollup';
import pkg from './package.json' assert { type: 'json' };

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
      tsconfig: './tsconfig.json',
      exclude: ['**/__tests__', '**/*.test.ts', '**/*.test.tsx'],
    }),
    postcss({
      extensions: ['.css'],
      extract: true,
      minimize: true,
      modules: true,
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
