const express = require('express');
const app = express();
const swig = require('swig');

const router = require('./router/api');

const mongoose = require('mongoose');

const Cookies = require('cookies');

const User = require('./models/User');

/**
 * 引用body-parser,解析前端的请求
 */
const bodyParser = require('body-parser')
//parse application/x-www-form-urlencodeed
app.use(bodyParser.urlencoded({extended: true}));


//设置express 的静态文件托管
//即客户端如果请求的是public 文件夹下的资源（css,js等静态资源）时，直接将__dirname + "/public"下的对应资源返回
app.use('/public', express.static(__dirname + "/public"));

//定义使用的模板引擎,第一个参数是模板引擎的名称，也是文件的后缀名；第二个参数是解析处理模板文件的方法
app.engine('html', swig.renderFile);

//设置模板文件存放目录，第一个参数必须，且必须是views，第二个参数是存放模板的目录
app.set('views', './views');

//注册所使用的模板引擎，第一个参数必须是view engine , 第二个参数与 app.engine('html', swig.renderFile) 中定义的模板引擎名称一致
app.set('view engine', 'html');

//开发环境下将缓存取消，以避免代码频繁修改时，因为缓存原因导致修改无法体现出来。
swig.setDefaults({
    cache: false
})

/* app.get('/', function(req, res, next) {
    //res.send('welcome to the home page .')
    //读取views目录 下的指定文件，解析并传给前端
    //第一个参数：表示模板的文件，相对于views 目录 views/index.html
    //第二个参数：传递给模板使用的数据；
    res.render('main/index');
}) */

//设置cookie ，只要访问服务器就对cookies 进行检查
app.use(function(req, res, next) {
    req.cookies = new Cookies(req, res);
    req.userInfo = {};
    //解析登录用户的cookie 信息
    if(req.cookies.get('userInfo')){
        try{
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));

            //获取当前登录用户是否为管理员
            User.findById(req.userInfo._id).then(function(userInfo) {
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            })
        }catch(e) {
            next();
            //throw new Error(e);
        }
    }else {
        next();
    }
})

/**
 * 引用对应的路由模块
 */
/* app.use('/admin' , require('./router/admin'));*/
app.use('/api' , require('./router/api')); 
app.use('/' , require('./router/main'));
app.use('/admin' , require('./router/admin'));

//连接数据库
mongoose.connect('mongodb://localhost:27017/blog' , (err) => {
    if (err) {
        console.log("数据库连接失败："+err);
    }else {
        app.listen(8082);
        console.log('数据库连接成功！请访问8082端口');
        
    }
})

//app.listen(8082);