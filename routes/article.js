let express = require('express');
let router = express.Router();
let fs = require('fs');
let formidable = require('formidable');
let Articles = require('./../models/articles')

let resCb = (res, code, msg, result) => {
  return res.json({
    code: code,
    msg: msg,
    result: result
  });
};

// demo 创建文件并写入数据 & 读取文件内容返回
router.post('/uploadText', (req, res, next) => {
  let text = req.body.text;
  let filename = `text${Date.parse(new Date()) / 1000}`;
  let filePath = `${process.cwd()}/public/articles/${filename}.txt`;
  fs.writeFile(filePath, text, {
    encoding: 'utf-8'
  }, err => {
    if (err) throw err;
    fs.readFile(filePath, (err, data) => {
      if (err) throw err;
      resCb(res, 200, 'success', `你刚写入的文件内容是${data}`);
    });
  })
});

// demo 上传图片
router.post('/uploadImg', (req, res, next) => {
  // 创建上传表单
  let form = new formidable.IncomingForm();
  form.encoding = 'utf-8';
  // 临时目录
  form.uploadDir = `${process.cwd()}/public/tmp/`;
  // 保留后缀
  form.keepExtensions = true;
  // 文件大小
  form.maxFieldsSize = 2 * 1024 * 1024;
  form.parse(req, (err, fields, files) => {
    if (err) throw err;
    // 校验图片格式
    if (!/^(image\/(p?)jpeg)|(image\/((x-)?)png)$/g.test(files.image.type)) {
      resCb(res, 501, '只支持png或jpg格式图片');
    } else {
      let timestamp = Date.parse(new Date()) / 1000
      let imgName = `img${timestamp}${files.image.name.split('.')[1]}`;
      // 图片在服务器完整地址
      let showPath = `${process.cwd()}/public/imgs/${imgName}`;
      fs.rename(files.image.path, showPath, (err) => {
        if (err) throw err;
        let result = {
          imgUrl: `http://192.168.31.121:3000/imgs/${imgName}`
        };
        resCb(res, 200, '上传成功', result);
      })
    }
  });
});

// 获取文章列表
router.get('/getArticles', (req, res, next) => {
  let offset = parseInt(req.query.offset),
      pageSize = parseInt(req.query.page_size),
      skip = (offset - 1) * pageSize,
      count = '';
  Articles.count((err, doc) => {
    if (err) throw err;
    count = doc;
  });
  Articles.find({}, (err, doc) => {
    if (err) throw err;
    res.json({
      code: 200,
      msg: '',
      count: count,
      result: doc
    })
  }).skip(skip).limit(pageSize);    
});

// 查看评论
router.get('/getComments', (req, res, next) => {
  let id = req.query.id,
    offset = parseInt(req.query.offset),
    pageSize = parseInt(req.query.page_size),
    skip = (offset - 1) * pageSize,
    count = '';
  Articles.find({'_id': id}, (err, doc) => {
    if (err) throw err;
    res.json({
      code: 200,
      msg: '',
      count: doc[0].comments.length,
      result: doc[0].comments.slice(skip, skip + pageSize)
    });
  })
});

// 发布 下线
router.put('/changeStatus', (req, res, next) => {
  let id = req.body.id,
    status = parseInt(req.body.status);
  Articles.update({'_id': id}, {$set: {'status': status}}, (err, doc) => {
    if (err) throw err;
    res.json({
      code: 200,
      msg: status == 1 ? '发布成功' : status == 0 ? '下线成功' : '',
      result: ''
    });
  });  
});

module.exports = router;
