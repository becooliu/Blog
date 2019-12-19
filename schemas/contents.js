//分类表
const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    //关联字段，通过ref 指定关联的模型；此字段在mongoose 中实际存储为ObjectId类型
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    author: String,
    create_time: {
        type: Date,
        default: Date.now
    },
    last_modify: {
        type: Date,
        default: Date.now
    },
    title: String,
    desc: String,
    content: String
})