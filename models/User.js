/**定义操作数据库schema的模型 */
const mongoose = require('mongoose');

const userSchema = require('../schemas/users');
module.exports = mongoose.model('User', userSchema);