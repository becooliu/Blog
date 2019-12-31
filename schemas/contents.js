//分类表
const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    //关联字段，通过ref 指定关联的模型；此字段在mongoose 中实际存储为ObjectId类型
    //timestamps 时间戳，默认保存记录的创建时间和最后更新时间，默认值为createAt和updateAt.
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    views:{
        type: Number,
        default: 0
    },
    author: String,
    title: String,
    desc: String,
    content: String
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})