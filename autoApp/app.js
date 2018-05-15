var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require('fs');

var index = require('./routes/index');
var admin = require('./routes/admin');
var wx = require('./routes/wx');


//设置process.env.NODE_ENV的环境变量
process.env.NODE_ENV = 'production';

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');
//app.set('view engine', 'jade');
// 开启模板缓存 Enables view template compilation caching.
app.set('view cache', true);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// app.use(logger('dev'));--默认日志写入到控制台

// 把日志写入文件
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'log/access.log'), {flags: 'a'});

// 日志的格式 logger(format, options)
// combined日志格式为：
// :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
app.use(logger('combined', {stream: accessLogStream}));



app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
app.use(session({
    secret: 'test',
    cookie:{
       path: '/wx',
       httpOnly: true,
       secure: false,
       maxAge: 30*60*1000
    }
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/admin', admin);
app.use('/wx', wx);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
