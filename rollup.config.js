import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import buble from 'rollup-plugin-buble'
import commonjs from 'rollup-plugin-commonjs'
import eslint from 'rollup-plugin-eslint'
import uglify from 'rollup-plugin-uglify'
import replace from 'rollup-plugin-replace'
import filesize from 'rollup-plugin-filesize'
import { minify } from 'uglify-es'

const options = {
  distName: 'vuetamin',
  umdName: 'VuetaminPlugin',
  transpiler: 'babel',
  styles: 'none',
  external: ['vue']
}

const isProduction = process.env.NODE_ENV === `production`

const isDevelopment = process.env.NODE_ENV === `development`

const libPath = (isDevelopment
      ? `dist/${options.distName}.js`
      : `dist/${options.distName}.min.js`)

const config = {
  input: 'libentry.js',
  output: {
    file: libPath,
    format: 'umd',
    name: options.umdName
  },
  external: options.external,
  plugins: [
    replace({
        'process.env.NODE_ENV': JSON.stringify( process.env.NODE_ENV )
    }),
    eslint({ include: [ '**/*.js', '**/*.vue' ] }),
    resolve({ jsnext: true, main: true, browser: true }),
    commonjs ()
  ],
  sourcemap: isDevelopment ? 'inline' : true
}

switch (options.transpiler){
  case 'babel' :
    config.plugins.push(babel())
    break;
  case 'buble' :
    config.plugins.push(buble())
    break;
  case 'none':
  default:
    break
}

if (isProduction) {
  config.plugins.push(replace({
    'process.env.NODE_ENV': JSON.stringify( 'production' )
  }))
  config.plugins.push(uglify({}, minify))
  config.plugins.push(filesize())
}

if (isDevelopment) {
  // config.plugins.push(livereload())
  // config.plugins.push(serve({
  //   contentBase: './public/',
  //   port: 8080,
  //   open: true
  // }))
}

export default config
