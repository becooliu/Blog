//定义操作数据库的schema 模型
const mongoose  = require('mongoose');

const contentSchema = require('../schemas/contents');

module.exports = mongoose.model('Content', contentSchema);