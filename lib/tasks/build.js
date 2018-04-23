'use strict';

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _gulpConnect = require('gulp-connect');

var _gulpConnect2 = _interopRequireDefault(_gulpConnect);

var _httpProxyMiddleware = require('http-proxy-middleware');

var _httpProxyMiddleware2 = _interopRequireDefault(_httpProxyMiddleware);

var _errorHandler = require('../helpers/errorHandler');

var _errorHandler2 = _interopRequireDefault(_errorHandler);

var _webpackStream = require('webpack-stream');

var _webpackStream2 = _interopRequireDefault(_webpackStream);

var _vinylNamed = require('vinyl-named');

var _vinylNamed2 = _interopRequireDefault(_vinylNamed);

var _webpack = require('../webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _gulpEnv = require('gulp-env');

var _gulpEnv2 = _interopRequireDefault(_gulpEnv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var net = require('net');

var envs = { NODE_ENV: _config2.default.NODE_ENV };

_gulp2.default.task('webpack', _gulp2.default.series(function (cb) {
  cb();
  return _gulp2.default.src([__dirname + '/index.js']).pipe(_gulpEnv2.default.set(envs)).pipe((0, _errorHandler2.default)()).pipe((0, _vinylNamed2.default)()).pipe((0, _webpackStream2.default)(_webpack2.default)).pipe(_gulp2.default.dest(_config2.default.argDist || _config2.default.dest)).pipe(_gulpConnect2.default.reload()).on('end', function () {
    cb();
    if (_config2.default.isProduction) {
      process.exit();
    }
  });
}));

_gulp2.default.task('connect', function (cb) {
  var innerConnect = _gulpConnect2.default;
  getPort().then(function (res) {
    var connect = innerConnect.server({
      host: '0.0.0.0',
      root: _config2.default.dest,
      port: _config2.default.server.port || res.port,
      livereload: true,
      middleware: function middleware(connect, opt) {
        var proxys = [];

        if (_config2.default.proxy) {
          for (var i = 0; i < _config2.default.proxy.length; i++) {
            proxys.push((0, _httpProxyMiddleware2.default)(_config2.default.proxy[i].source, {
              target: _config2.default.proxy[i].target,
              changeOrigin: true,
              secure: false,
              headers: {
                Connection: 'keep-alive'
              }
            }));
          }
        }

        return proxys;
      }
    });

    connect.server.on('close', function () {});
    cb();
  });
});

_gulp2.default.task('clean', function (cb) {
  var dest = _config2.default.dest;
  try {
    _del2.default.sync([dest + '/**/*', '!' + dest + '/WEB-INF/**', '!' + dest + '/APP_INFO/**'], { force: true });
  } catch (e) {
    console.log('%s do not clean', dest);
  }
  cb();
});

_gulp2.default.task('copystatics', function (cb) {
  var dest = _config2.default.dest;

  try {
    _gulp2.default.src('src/statics/asset/**/*').pipe(_gulp2.default.dest(dest + '/statics/asset'));
  } catch (e) {
    console.log('%s do not clean', dest);
  }
  cb();
});

_gulp2.default.task('build', _gulp2.default.series(_gulp2.default.parallel('clean', 'webpack', 'copystatics'), function (cb) {
  cb();
}));

_gulp2.default.task('default', _gulp2.default.series('clean', _gulp2.default.parallel('webpack', 'connect', 'copystatics'), function (cb) {
  cb();
}));

function getPort() {
  return new Promise(function (resolve, reject) {
    function checkportIsOccupied(port) {
      portIsOccupied(port).then(function (res) {
        if (res) {
          resolve({ port: port });
        } else {
          checkportIsOccupied(port + 1);
        }
      });
    }

    checkportIsOccupied(8080);
  });
}

// 检测端口是否被占用
function portIsOccupied(port) {
  // 创建服务并监听该端口
  return new Promise(function (resolve, reject) {
    var server = net.createServer().listen(port, '0.0.0.0');
    server.on('listening', function () {
      // 执行这块代码说明端口未被占用
      server.close(); // 关闭服务
      resolve(true);
    });

    server.on('error', function (err) {
      if (err.code === 'EADDRINUSE') {
        // 端口已经被使用
        resolve(false);
      }
    });
  });
}