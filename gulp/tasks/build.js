import gulp from 'gulp'
import del from 'del'
import config from '../config'
import connect from 'gulp-connect'
import proxy from 'http-proxy-middleware'

import errorHandler from '../helpers/errorHandler'

import webpackGulp from 'webpack-stream'
import named from 'vinyl-named'

import configWebpack from '../webpack'
import env from 'gulp-env'
var net = require('net');

var envs = {NODE_ENV: config.NODE_ENV}

gulp.task('webpack', gulp.series(function (cb) {
  cb()
  return gulp
    .src([__dirname+'/index.js'])
    .pipe(env.set(envs))
    .pipe(errorHandler())
    .pipe(named())
    .pipe(webpackGulp(configWebpack))
    .pipe(gulp.dest(config.argDist || config.dest))
    .pipe(connect.reload())
    .on('end', function(){
      cb()
      if(config.isProduction){
        process.exit()
      }
    })
}))


gulp.task('connect', function(cb){
  var innerConnect = connect
  getPort().then((res)=>{
    var connect = innerConnect.server({
      host:'0.0.0.0',
      root: config.dest,
      port: config.server.port || res.port,
      livereload: true,
      middleware: function (connect, opt) {
        let proxys = []

        if (config.proxy) {
          for (let i = 0; i < config.proxy.length; i++) {
            proxys.push(proxy(config.proxy[i].source, {
              target: config.proxy[i].target,
              changeOrigin: true,
              secure: false,
              headers: {
                Connection: 'keep-alive'
              }
            }))
          }
        }

        return proxys
      }
    })

    connect.server.on('close', function () {

    })
    cb()
  })
})

gulp.task('clean', function(cb){
  var dest = config.dest
  try {
    del.sync([dest + '/**/*', '!' + dest + '/WEB-INF/**', '!' + dest + '/APP_INFO/**'], {force: true})
  } catch (e) {
    console.log('%s do not clean', dest)
  }
  cb()
})

gulp.task('copystatics', function (cb) {
  var dest = config.dest

  try {
    gulp.src('src/statics/asset/**/*')
      .pipe(gulp.dest(dest+'/statics/asset'))

  } catch (e) {
    console.log('%s do not clean', dest);
  }
  cb()
});

gulp.task('build', gulp.series(gulp.parallel('clean', 'webpack', 'copystatics'),function(cb){
  cb()
}))

gulp.task('default', gulp.series('clean',gulp.parallel( 'webpack', 'connect', 'copystatics'),function(cb){
  cb()
}))

function getPort() {
  return new Promise(function (resolve, reject) {
    function checkportIsOccupied(port) {
      portIsOccupied(port).then((res)=>{
        if(res){
          resolve({port:port})
        }else{
          checkportIsOccupied(port+1)
        }
      })
    }

    checkportIsOccupied(8080)
  })
}

// 检测端口是否被占用
function portIsOccupied (port) {
  // 创建服务并监听该端口
  return new Promise(function (resolve, reject) {
    var server = net.createServer().listen(port, '0.0.0.0')
    server.on('listening', function () { // 执行这块代码说明端口未被占用
      server.close() // 关闭服务
      resolve(true)
    })

    server.on('error', function (err) {
      if (err.code === 'EADDRINUSE') { // 端口已经被使用
        resolve(false)
      }
    })
  })
}
