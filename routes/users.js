let express = require('express');
let router = express.Router();
let User = require('./../models/users');
let mongoose = require('mongoose');

mongoose.Promise = global.Promise;
// 连接数据库
mongoose.connect('mongodb://127.0.0.1:27017/homepage', { useMongoClient: true });

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected success');
});

mongoose.connection.on('error', () => {
  console.log('MongoDB connected fail');
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connected disconnected');
});

let resCb = (res, code, msg, result) => {
  return res.json({
    code: code,
    msg: msg,
    result: result
  });
};

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// isLogin
router.get('/isLogin', (req, res, next) => {
  if (req.cookies.userId) {
    resCb(res, 200, '已登录');
  } else {
    resCb(res, 8001, '未登录');
  }
});

// login
router.post('/login', (req, res, next) => {
  let param = {
    userName: req.body.username,
    userPwd: req.body.password
  };
  User.findOne(param, (err, userDoc) => {
    if (err) throw err;
    if (userDoc) {
      // write cookie
      res.cookie('userId', userDoc.userId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24
      });
      let result = {
        userName: userDoc.userName,
        nickName: userDoc.nickName,
        lastLoginIP: userDoc.lastLoginIP,
        lastLoginTime: userDoc.lastLoginTime,
        pageViews: userDoc.pageViews
      };
      resCb(res, 200, '登录成功', result);
    } else {
      resCb(res, 501, '账号或密码错误');
    }
  })
});

// logout
router.put('/logout', (req, res, next) => {
  // clear cookie
  res.cookie('userId', '', {
    path: '/',
    maxAge: -1
  });
  resCb(res, 200, '退出成功')
})

module.exports = router;