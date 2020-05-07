var express = require('express');
// var ejs = require('ejs');
var path = require('path');
var app = express();
var logger = require('morgan');
var https = require('https');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');

let options = {
    key: fs.readFileSync('./ssl/2940601_www.wuzhenlu.cn.key'),
    cert: fs.readFileSync('./ssl/2940601_www.wuzhenlu.cn.pem'),
}

var ueditor = require("ueditor");
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');
var xcx = require('./routes/xcx');

var app = express();

app.set('views', path.join(__dirname, 'views'));
   // app.engine('.html', ejs.__express);
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
// view engine setup

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser());


app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/admin',admin);
app.use('/xcx',xcx);

app.use("/admin/ueditor/ue", ueditor(path.join(__dirname, 'public'), function (req, res, next) {
    //客户端上传文件设置
    var imgDir = '/admin/img/ueditor/'
     var ActionType = req.query.action;
    if (ActionType === 'uploadimage' || ActionType === 'uploadfile' || ActionType === 'uploadvideo') {
        var file_url = imgDir;//默认图片上传地址
        /*其他上传格式的地址*/
        if (ActionType === 'uploadfile') {
            file_url = '/admin/file/ueditor/'; //附件
        }
        if (ActionType === 'uploadvideo') {
            file_url = '/admin/video/ueditor/'; //视频
        }
        res.ue_up(file_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
        res.setHeader('Content-Type', 'text/html');
    }
    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage') {
        var dir_url = imgDir;
        res.ue_list(dir_url); // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {
        // console.log('config.json')
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/admin/ueditor/nodejs/config.json');
    }
}));








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







// app.use('/', function (req, res) {
//     res.render('ueditor');
// });


app.listen(80, function () {
    console.log('server is runing.....');
});
https.createServer(options,app).listen(443)
module.exports = app;
