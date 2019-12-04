//主要路由

const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    //console.log(req.userInfo);
    res.render('main/index.html', {
        //此处为模板的第二个参数，将userInfo 传递给模板以在页面中直接调用
        userInfo: req.userInfo
    })
})

module.exports = router;
