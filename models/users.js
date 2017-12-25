let mongoose = require('mongoose')

// 定义模型
let userSchema = new mongoose.Schema({
  "userId": String,
  "userName": String,
  "userPwd": String,
  "nickName": String,
  "lastLoginTime": Number,
  "lastLoginIP": String,
  "pageViews": Number
})

// 模型输出 
module.exports = mongoose.model('Users', userSchema)