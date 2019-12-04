//定义操作数据库的schema 模型
const mongoose  = require('mongoose');

const categorySchema = require('../schemas/categories');
module.exports = mongoose.model('Category', categorySchema);