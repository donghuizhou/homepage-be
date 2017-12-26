let express = require('express');
let router = express.Router();
let User = require('./../models/users');
let mongoose = require('mongoose');

mongoose.Promise = global.Promise;
// 连接数据库
mongoose.connect('mongodb://127.0.0.1:27017/homepage', {useMongoClient: true});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected success');
});

mongoose.connection.on('error', () => {
  console.log('MongoDB connected fail');
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connected disconnected');
});

let errCb = (res, err) => {
  return res.json({
    code: 501
  });
};

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// isLogin
router.get('/isLogin', (req, res, next) => {
  if (req.cookies.userId) {
    res.json({
      code: 200,
      msg: '已登录',
      result: ''
    });
  } else {
    res.json({
      code: 8001,
      msg: '未登录',
      result: ''
    });
  }
});

// login
router.post('/login', (req, res, next) => {
  let param = {
    userName: req.body.username,
    userPwd: req.body.password
  };
  User.findOne(param, (err, userDoc) => {
    if (err) {
      errCb(res, err);
    } else {
      if (userDoc) {
        // write cookie
        res.cookie('userId', userDoc.userId, {
          path: '/',
          maxAge: 1000 * 60 * 60 * 24
        });
        res.json({
          code: 200,
          msg: '登录成功',
          result: {
            userName: userDoc.userName,
            nickName: userDoc.nickName,
            lastLoginIP: userDoc.lastLoginIP,
            lastLoginTime: userDoc.lastLoginTime,
            pageViews: userDoc.pageViews
          }
        });
      }
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
  res.json({
    code: 200,
    msg: '退出成功',
    result: ''
  });
})

module.exports = router;
