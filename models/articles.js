let mongoose = require('mongoose');

// 定义模型
let articleSchema = new mongoose.Schema({
  "author": String,
  "title": String,
  "articlePath": String,
  "createTime": Number,
  "tags": Array,
  "category": Number,
  "readingAmounts": Number,
  "comments": [
    {
      "critics": String,
      "message": String,
      "time": Number
    }
  ],
  "status": Number
});

// 模型输出 
module.exports = mongoose.model('Articles', articleSchema);