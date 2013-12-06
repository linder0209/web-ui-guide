/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    partials = require('express-partials'),
    settings = require('./settings'),
    flash = require('connect-flash'),//引入flash模块用来实现页面的通知和错误信息显示功能
    MongoStore = require('connect-mongo')(express); //注意：后面有(express)

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(flash());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
//app.use(express.cookieParser('your secret here'));
//app.use(express.session());
app.use(express.cookieParser());//express.cookieParser() 是 Cookie 解析的中间件
app.use(express.session({ //express.session() 则提供会话支持
    secret: settings.cookieSecret,
    store: new MongoStore({ //设置它的 store 参数为 MongoStore 实例，把会话信息存储到数据库中，以避免丢失
        db: settings.db
    }),
    //设置key和cookie，重启浏览器不需要重新登录
    key: 'learnnodejs', // 你的cookie名，不要用默认的'connect.sid'，因为可能被其他网站使用
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30} // 30 days
}));
app.use(partials());//注意运用partials一定要放在  app.use(app.router);之前设置
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

/**
 * 引入视图助手
 * 为了实现不同登录状态下页面呈现不同内容的功能，我们需要创建动态视图助手，
 * 通过它我们才能在视图中访问会话中的用户数据。同时为了显示错误和成功的信息，也要在动态视图助手中增加响应的函数。
 */
app.use(function (req, res, next) {
    var err = req.flash('error'),
        success = req.flash('success');
    res.locals.user = req.session.user;
    res.locals.error = err.length ? err : null;
    res.locals.success = success.length ? success : null;
    next();
});

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// 加载路由选择
routes(app);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
