//主要路由

const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Content = require('../models/Content');

router.get('/', (req, res, next) => {
    let categories = [];
    //console.log(id);
    Category.find().then(rs => {
        if (rs) {
            categories = rs;
        }else {
            res.render('main/error', {
                userInfo: req.userInfo,
                message: "未找到任何分类"
            })
            return new Promise.reject();
        }
        
        return Content.find().sort({_id: -1}).populate('category_id').then(content => {
            if(!content) {
                res.render('main/error' , {
                    userInfo: req.userInfo,
                    message: "未找到相关内容"
                })
                return;
            }
            
            res.render('main/index' , {
                userInfo: req.userInfo,
                contents: content,
                categories: categories
            })
        })
    })
    /* res.render('main/index.html', {
        //此处为模板的第二个参数，将userInfo 传递给模板以在页面中直接调用
        userInfo: req.userInfo
    }) */
})

module.exports = router;
