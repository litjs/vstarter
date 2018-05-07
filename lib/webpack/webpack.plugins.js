'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

var _stringReplaceWebpackPlugin = require('string-replace-webpack-plugin');

var _stringReplaceWebpackPlugin2 = _interopRequireDefault(_stringReplaceWebpackPlugin);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _entryHashWebpackPlugin = require('entry-hash-webpack-plugin');

var _entryHashWebpackPlugin2 = _interopRequireDefault(_entryHashWebpackPlugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HappyPack = require('happypack');
var os = require('os');
var happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

var plugins = [new HappyPack({
  id: 'happybabel',
  loaders: ['babel-loader'],
  threadPool: happyThreadPool,
  verbose: false
}), new HappyPack({
  id: 'happyvue',
  loaders: ['vue-loader'],
  threadPool: happyThreadPool,
  verbose: false
}),

// fix for moment
new _webpack2.default.IgnorePlugin(/^\.\/locale$/, /moment$/), new _webpack2.default.optimize.AggressiveMergingPlugin({
  moveToParents: true
}), new _extractTextWebpackPlugin2.default(_config2.default.assets.styles + '/[name].css', {
  // allChunks: true,
  disable: true //config.isDeveloper,
}), new _stringReplaceWebpackPlugin2.default(), new _webpack2.default.DefinePlugin({
  DEBUG: _config2.default.isDebug,
  'process.env': Object.assign({}, { 'NODE_ENV': '\'' + _config2.default.NODE_ENV + '\'' }, _config2.default.env)
})];
plugins.push(new _entryHashWebpackPlugin2.default({ isProduction: _config2.default.isProduction, entryName: _config2.default.vueEntryConfig.chunkName }));
_config2.default.isProduction && plugins.push(new _webpack2.default.optimize.UglifyJsPlugin({
  compress: {
    warnings: false
  },
  mangle: {}
}));

exports.default = plugins;