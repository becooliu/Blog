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
    var limit = 5; //每页显示的条数
    var page = Number(req.query.page || 1); //显示第几页
    var pages = 0; //总页数

    Content.countDocuments().then(function(count) {
        pages = Math.ceil(count / limit);
        page = Math.max(1,page);
        page = Math.min(pages,page);
        const skip = (page - 1) * limit;
        /***此处重点：通过schema 中的关联字段 category_id 在查询时，同时查询Category 表中的分类信息，使用populate("关联字段")方法***/
        Content.find().sort({_id: -1}).limit(limit).skip(skip).populate('category_id').then(cts => {
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
    //console.log(req.body);
    let data = req.body;
    let category_id = data.category;
    let author = req.userInfo.username;
    let title = data.title;
    let desc = data.description;
    let content = data.content;

    let save_data = {
        category_id,
        author,
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
    //获取要修改的数据并展示
router.get('/content/edit', (req, res) => {
    let id = req.query.id || "";
    let categories = [];
    //console.log(id);
    Category.find().then(rs => {
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
        
        return Content.findOne({_id: id}).sort({_id: -1}).populate('category_id').then(content => {
            if(!content) {
                res.render('/admin/error' , {
                    userInfo: req.userInfo,
                    message: "未找到相关内容",
                    url: "/admin/content"
                })
                return;
            }
            
            res.render('admin/content_edit' , {
                userInfo: req.userInfo,
                contents: content,
                categories: categories
            })
        })
    })
})

    //点击修改后对数据校验后进行保存
router.post('/content/edit' , (req, res) => {
    let id = req.query.id;
    let resData = req.body;
    Content.findOne({_id: id}).then(rs => {
        if (!rs) {
            res.render('/admin/error', {
                userInfo: req.userInfo,
                message: "未找到相关的内容",
                url: '/admin/content'
            })
            return new Promise.reject();
        }
        let updateCondition = {_id: id};
        let category_id = resData.category;
        let title = resData.title;
        let desc = resData.desc;
        let content = resData.content;

        let save_data = {
            category_id,
            title,
            desc,
            content
        };

        Content.updateOne(updateCondition, {$set: save_data}, (err, rep) => {
            if (err) {
                res.render('admin/error' , {
                    userInfo: req.userInfo,
                    message: '内容修改失败，请联系管理员',
                    url: '/admin/content'
                })
            }else {
                res.render('admin/success' , {
                    userInfo: req.userInfo,
                    message: '恭喜，内容修改成功',
                    url: '/admin/content'
                })
            }

        })
    })
})

//内容删除
router.get('/content/delete' , (req, res) => {
    let id = req.query.id;
    Content.findByIdAndDelete(id, (err , rs) => {
        if (err) {
            res.render('admin/error' , {
                userInfo: req.userInfo,
                message: '无此内容，删除失败',
                url: '/admin/error'
            })
        }else {
            if (rs == 'null') {
                res.render('admin/error' , {
                    userInfo: req.userInfo,
                    message: "没有此内容相关的数据或此内容id为空",
                    url: "/admin/content"
                })
                return new Promise().reject();
            } else {
                console.log(rs);
                res.render('admin/success' , {
                    userInfo: req.userInfo,
                    message: '内容<<'+ rs.title +'>>删除成功',
                    url: '/admin/content'
                })
            }
        }
    })
})

module.exports = router;