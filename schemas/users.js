/*用户表 */
const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    //用户名
    username: String,
    //密码
    password: String,
    isAdmin: {
        type: Boolean,
        default: false
    }
})