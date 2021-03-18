//主要路由

const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Content = require('../models/Content');

router.get('/', (req, res) => {
    //根据首页请求是否携带分类id 参数
    let c_id = req.query.category_id;
    
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
            if(c_id) {
                let ct = [];
                for(let i = 0,length = content.length; i< length; i++) {
                    //console.log('[DEBUG_INFO]'+content[i])
                    //console.log('Debug_info'+c_id)
                    if(content[i].category == c_id) {
                        ct.push(content[i]);
                    }
                }
                res.render('main/content_list' , {
                    userInfo: req.userInfo,
                    contents: ct,
                    categories: categories
                })
            }else {
                res.render('main/content_list' , {
                    userInfo: req.userInfo,
                    contents: content,
                    categories: categories
                })

            }
            
        })
    });
    
});

router.get('/main/detail', (req, res) => {
    let categories = [];
    let blog_id = req.query.id || "";
    Category.find().then(ct => {
        if (!ct) {
            res.render('main/error' , {
                userInfo: req.userInfo,
                message: '无任何分类'
            })
        }else {
            categories = ct;
        }
    })
    if (blog_id != "" || blog_id != "null") {
        
        Content.findById(blog_id).then(content => {
            if (!content) {
                res.render('main/error' , {
                    userInfo: req.userInfo,
                    message: '未找到此博客内容',
                    url: '/main/index'
                })
            }else {
                let view_counts = content.views+1;
                let update_condition = {
                    _id: blog_id
                };
                let toSave_data = {views: view_counts};
                Content.updateOne(update_condition , {$set: toSave_data}, (err, save_res) => {
                    console.log(save_res);
                    if(err) {
                        return new Promise.reject(err);
                    }
                    Content.findById(blog_id).then(conts => {
                        res.render('main/detail' , {
                            userInfo: req.userInfo,
                            contents: conts,
                            categories: categories
                        })
                    })
                })
            }
        })
    }
})

router.post('/main/detail' , (req , res) => {
    console.log(req.query);
    console.log(req.body);
    let blog_id = req.query.id;
    let comment = req.body.comment;
})

module.exports = router;
