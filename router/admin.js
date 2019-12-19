//管理员模块路由

const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Category = require('../models/Category')
const Content = require('../models/Content')

/* router.get('/user', (req, res , next) => {
    res.send('user');
}) */
router.use(function(req, res, next) {
    if(!req.userInfo.isAdmin) {
        res.send('对不起，只有管理员才可以进入该页面。');
        return;
    }
    next();
})

//首页
router.get('/', function(req, res, next) {
    res.render('admin/index.html' , {
        userInfo: req.userInfo
    })
})


//用户管理
router.get('/user_info', function(req, res, next) {
    //获取所有用户
    var limit = 2; //每页显示的条数
    var page = Number(req.query.page || 1); //显示第几页
    var pages = 0; //总页数
    User.count().then(function(count) {
        pages = Math.ceil(count / limit);
        page = Math.max(page , 1); //页数最小不能小于1
        page = Math.min(page, pages); //页数最大不能超过总页数
        var skip = (page-1) * limit;

        User.find().limit(limit).skip(skip).then(users => {
            res.render('admin/user_info.html' , {
                userInfo: req.userInfo,
                users: users,
                count: count, //数据总条数
                pages: pages, //总共多少页
                limit: limit, //每页显示几条
                page: page, //当前是第几页
                pagetype: "user_info"
            })
        })
        
    })
})

//分类管理
router.get('/category', function(req, res) { // 分类首页
    var limit = 2; //每页显示的条数
    var page = Number(req.query.page || 1); //显示第几页
    var pages = 0; //总页数
    Category.countDocuments().then(function(count) {
        pages = Math.ceil(count / limit);
        page = Math.max(1,page);
        page = Math.min(pages,page);
        const skip = (page - 1) * limit;
        Category.find().limit(limit).skip(skip).then(categories => {
            res.render('admin/category_index' , {
                userInfo: req.userInfo,
                categories: categories,
                count: count, //数据总条数
                pages: pages, //总共多少页
                limit: limit, //每页显示几条
                page: page, //当前是第几页
                pagetype: "category" //传递给分页使用
            })
        })
    })
})

//分类添加
router.get('/category/add', function(req, res, next) {
    res.render('admin/category_add' , {
        userInfo: req.userInfo
    })
})

router.post('/category/add', function(req, res, next) {
    let name = req.body.name || '';
    if (name == "" || name == "null") {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '分类名不能为空',
            url: '/admin/category/add'
        })
    }

    Category.findOne({
        name: name
    }).then(cty => {
        if (cty) {
            res.render('admin/error' , {
                userInfo: req.userInfo,
                message: '分类名已存在。',
                url: '/admin/category/add'
            })
            return Promise.reject();
        }else {
            return new Category({
                name: name
            }).save();
            
        }
    }).then(newCate => {
        res.render('admin/success' , {
            userInfo: req.userInfo,
            message: '分类添加成功',
            url: '/admin/category'
        })
    })
})

//分类修改
router.get('/category/edit' , (req , res) => {
    let id = req.query.id;
    Category.findOne({_id: id}).then(category => {
        if(!category) {
            res.render('admin/error' , {
                userInfo: req.userInfo,
                message: '分类不存在'
            })
        }else {
            res.render('admin/category_edit', {
                userInfo: req.userInfo,
                category: category
            })
        }
    })
})

router.post('/category/edit' , (req, res) => {
    let id = req.query.id;
    let name = req.body.name;
    Category.findOne({_id: id}).then(category => {
        if(!category) {
            res.render('admin/error' , {
                userInfo: req.userInfo,
                message: '分类不存在',
                url: 'admin/category'
            })
            return Promise.reject();
        }else {
            if (name == category.name) { //用户未作任何修改就提交时
                res.render('/admin/error' , {
                    userInfo: req.userInfo,
                    message: '分类名称没有修改',
                    url: 'admin/category'
                })
                return Promise.reject();
            }else {  //用户对分类名作了修改了，要判断数据库中是否还存在同名的分类，即id不同但分类名相同
                return Category.findOne({_id: {$ne: id}, name: name})
            }
        }
    }).then(sameCategory => {
        if (sameCategory) {
            res.render('admin/error' , {
                userInfo: req.userInfo,
                message: '分类名存在，请确认'
            })
            return Promise.reject();
        }else {
            return Category.updateOne({_id: id}, {name: name})
        }
    }).then(function(){
        res.render('admin/success' , {
            userInfo: req.userInfo,
            message: '修改成功',
            url: '/admin/category'
        })
    })
})

//分类删除
router.get('/category/delete' , (req, res) => {
    let condition = {_id: req.query.id};

    Category.findOne(condition).then(category => {
        if(!category) {
            res.render('admin/error' , {
                userInfo: req.userInfo,
                message: '分类不存在',
                url: '/admin/category'
            })
        }else {
            let name = category.name;
            Category.deleteOne(condition, err => {
                if(err) {
                    res.render('admin/error', {
                        userInfo: req.userInfo,
                        message: "分类删除失败"+err,
                        url: '/admin/category'
                    })
                }else {
                    res.render('admin/success' , {
                        userInfo: req.userInfo,
                        message: '分类'+name+'删除成功',
                        url: '/admin/category'
                    })
                }
            })
        }
    })
})

/* 内容首页 */
router.get('/content', (req, res) => {
    var limit = 2; //每页显示的条数
    var page = Number(req.query.page || 1); //显示第几页
    var pages = 0; //总页数

    Content.countDocuments().then(function(count) {
        console.log(count)
        pages = Math.ceil(count / limit);
        page = Math.max(1,page);
        page = Math.min(pages,page);
        const skip = (page - 1) * limit;
        /***此处重点：通过schema 中的关联字段 category_id 在查询时，同时查询Category 表中的分类信息，使用populate("关联字段")方法***/
        Content.find().limit(limit).skip(skip).populate('category_id').then(cts => {
            console.log(cts);
            res.render('admin/content_index' , {
                userInfo: req.userInfo,
                contents: cts,
                count: count, //数据总条数
                pages: pages, //总共多少页
                limit: limit, //每页显示几条
                page: page, //当前是第几页
                pagetype: "content" //传递给分页使用
            })
        })
    })
})

/* 内容添加 */
router.get('/content/add' , (req, res) => {
    Category.find().then(category => {
        if (category) {
            res.render('admin/content_add' , {
                userInfo: req.userInfo,
                categories: category
            })

        }else {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '未添加分类，请先去添加',
                url: '/admin/category/add'
            })
        }
    })
})

/*** 添加内容 ***/
router.post('/content/add' , (req, res) => {
    console.log(req.body);
    let data = req.body;
    let category_id = data.category;
    let author = req.userInfo.username;
    let create_time = Date.now();
    let last_modify = Date.now();
    let title = data.title;
    let desc = data.description;
    let content = data.content;

    let save_data = {
        category_id,
        author,
        create_time,
        last_modify,
        title,
        desc,
        content
    }
    
    return new Promise((resolve , reject) => {
        if (new Content(save_data).save()) {
            resolve(
                res.render('admin/success' , {
                    userInfo: req.userInfo,
                    message: '博客内容添加成功',
                    url: '/admin/content'
                })
            )
        }else {
            reject(
                res.render('admin/error' , {
                    userInfo: req.userInfo,
                    message: "内容添加失败",
                    url: "/admin/content"
                })
            )
        }
    })
})

// 修改内容
router.get('/content/edit', (req, res) => {
    let id = req.query.id || "";
    let categories = [];
    Category.find().sort({_id: -1}).then(rs => {
        if (rs) {
            categories = rs;
        }else {
            res.render('/admin/error', {
                userInfo: req.userInfo,
                message: "此文章不属于任何分类，无法修改",
                url: '/admin/content'
            })
            return new Promise.reject();
        }
        
        return Content.findOne({_id: id}).populate('category_id').then(content => {
            if(!content) {
                res.render('/admin/error' , {
                    userInfo: req.userInfo,
                    message: "未找到相关内容",
                    url: "/admin/content"
                })
                return;
            }
            /* for let (i in content) {
                console.log(i, content[i])
            } */
            console.log(content);
            res.render('admin/content_edit' , {
                userInfo: req.userInfo,
                contents: content,
                categories: categories
            })
        })
    })
})

module.exports = router;