//api 模块路由
const express = require('express');
const router = express.Router();

//引用数据库操作模块,它是一个构造函数
const User = require('../models/User');

const responseData = {} ;

//用户注册返回统一的数据
router.use(function(req, res, next) {
    responseData.code = '';
    responseData.message = '';
    
    next();
})

router.post('/user/register', (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    let repassword = req.body.repassword;
    //注册用户：用户名、密码不能为空，且密码与确认密码必须一致；用户名必须为未注册
    //用户名密码不为空判断
    if(username == '' || password == '') {
        responseData.code = '1';
        responseData.message = '用户名或密码名不能为空';
        
        res.json(responseData);
        return;
    }
    //两次输入密码一致判断
    if(password != repassword) {
        responseData.code = '2';
        responseData.message = '两次输入的密码不一致';
        
        res.json(responseData);
        return;
    }

    //操作数据库，判断用户是否已注册
    User.findOne({username: username}).then(userInfo => {
        //如果查询返回了数据，说明用户名已被注册了
        if(userInfo) {
            responseData.cdde = '4';
            responseData.message = '用户名已注册';
            res.json(responseData);
            return;
        }
        //如果用户名没有被注册，则实例化数据库操作的构造函数，并将用户名密码保存到数据库
        let user = new User({
            username: username, 
            password: password
        });
        return user.save()
    }).then(newUserinfo => {
        console.log(newUserinfo);
        //注册逻辑正确，用户注册成功
        responseData.code = '3';
        responseData.message = '用户注册成功。';
        res.json(responseData);
    })

    
})

//用户登录
router.post('/user/login', function(req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    console.log('username='+username);
    if(username == '' || username == 'null' || password == '' || password == 'null') {
        responseData.code = 0;
        responseData.message = '用户名或密码不能为空';
        res.json(responseData);
        return;
    }
    User.findOne({
        username: username,
        password: password
    }).then(userInfo => {
        //console.log(userInfo);
        if(userInfo == null) {
            responseData.code = 1;
            responseData.message = '用户名或密码错误';
            res.json(responseData);
            return;
        }
        
        responseData.code = 2;
        responseData.message = '登录成功';
        responseData.userInfo = {
            _id: userInfo._id,
            username: userInfo.username
        };
        req.cookies.set('userInfo', JSON.stringify({
            _id: userInfo._id,
            username: userInfo.username
        }))
        res.json(responseData);
    })

})

//登出
router.get('/user/logout', function(req, res) {
    req.cookies.set('userInfo', null);
    responseData.code = 'null';
    res.json(responseData);
})

module.exports = router;