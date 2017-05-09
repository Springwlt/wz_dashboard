var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var winston = require('winston');
var expressWinston = require('express-winston');
var admin = require('./routes/admin');
var supervisor = require('./routes/supervisor');
var question = require('./routes/question');
var tag = require('./routes/tag');
var auth = require('./routes/api/v1.0/auth');
var user = require('./routes/api/v1.0/user');
var order = require('./routes/api/v1.0/order');
var mUser = require('./routes/user');
var mGoods = require('./routes/goods');
var goods = require('./routes/api/v1.0/goods');
var talentspieUser = require('./routes/api/v1.0/talentspie');
var settings = require('./settings');
var flash = require('connect-flash');
var app = express();
//设置本地变量
app.locals.appTitle = '玩转文化传媒（上海）有限公司-管理后台';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());

app.use(session({
    secret: settings.cookieSecret,
    key: settings.db,
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30}, //30days
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
        url: 'mongodb://' + settings.host + ':' + settings.port + '/' + settings.db
    })
}));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Authorization
var authorize = function (req, res, next) {
    return next();
}

// 正常请求的日志
/**app.use(expressWinston.logger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/success.log'
    })
  ]
}));**/

// Pages and routes
admin(app);
supervisor(app);
question(app);
tag(app);
auth(app);
user(app);
order(app);
goods(app);
mUser(app);
mGoods(app);
talentspieUser(app);
app.set('superSecret', settings.secret);
// 错误请求的日志
/**app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}));**/

app.set('port', process.env.PORT || 3300);

var server = http.createServer(app);
var boot = function () {
    server.listen(app.get('port'), function () {
        console.info('Express server listening on port ' + server.address().port);
    });
}
var shutdown = function () {
    server.close();
}
if (require.main === module) {
    boot();
} else {
    console.info('Running app as a module');
    exports.boot = boot;
    exports.shutdown = shutdown;
    exports.port = app.get('port');
}
