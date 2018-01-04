let mongoose = require('mongoose');

// 定义模型
let cateSchema = new mongoose.Schema({
  "cateId": Number,
  "cateName": String
});

// 模型输出 
module.exports = mongoose.model('Categories', cateSchema);