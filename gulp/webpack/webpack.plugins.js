import ExtractTextPlugin from 'extract-text-webpack-plugin'
import StringReplacePlugin from 'string-replace-webpack-plugin'
import webpack from 'webpack'
import path from 'path'
import config from '../config'
import entryHashWebpackPlugin from 'entry-hash-webpack-plugin'
var HappyPack = require('happypack');
var os = require('os')
var happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

var plugins = [
  new HappyPack({
    id: 'happybabel',
    loaders: ['babel-loader'],
    threadPool: happyThreadPool,
    verbose: false
  }),

  new HappyPack({
    id: 'happyvue',
    loaders: ['vue-loader'],
    threadPool: happyThreadPool,
    verbose: false
  }),

  // fix for moment
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

  new webpack.optimize.AggressiveMergingPlugin({
    moveToParents: true,
  }),

  new ExtractTextPlugin(
    config.assets.styles + '/[name].css', {
      // allChunks: true,
      disable: true //config.isDeveloper,
    }
  ),

  new StringReplacePlugin(),

  new webpack.DefinePlugin({
    DEBUG: config.isDebug,
    'process.env':Object.assign({}, {'NODE_ENV':`'${config.NODE_ENV}'`}, config.env)
  })
]
plugins.push(new entryHashWebpackPlugin({isProduction:config.isProduction, entryName:config.vueEntryConfig.chunkName}))
config.isProduction && plugins.push(
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    },
    mangle: {},
  })
)

export default plugins
