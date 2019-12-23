//主要路由

const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Content = require('../models/Content');

router.get('/', (req, res) => {
    let c_id = req.query.category_id;
    //根据首页请求是否携带分类id 参数
    
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
            console.log('content='+content)
            
            res.render('main/index' , {
                userInfo: req.userInfo,
                contents: content,
                categories: categories
            })
        })
    });
    
});

module.exports = router;
