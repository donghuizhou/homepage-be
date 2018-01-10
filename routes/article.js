let express = require('express');
let router = express.Router();
let fs = require('fs');
let formidable = require('formidable');
let Articles = require('./../models/articles');
let Categories = require('./../models/categories');

let resCb = (res, code, msg, result) => {
  return res.json({
    code: code,
    msg: msg,
    result: result
  });
};

// 获取文章列表
router.get('/getArticles', (req, res, next) => {
  let offset = parseInt(req.query.offset),
      pageSize = parseInt(req.query.page_size),
      skip = (offset - 1) * pageSize,
      count = '';
  Articles.count({'del': {$eq: 0}},(err, doc) => {
    if (err) throw err;
    count = doc;
  });
  Articles.find({'del': {$eq: 0}}, (err, doc) => {
    if (err) throw err;
    res.json({
      code: 200,
      msg: '',
      count: count,
      result: doc
    })
  }).sort({'createTime': -1}).skip(skip).limit(pageSize);    
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

// 删除文章
router.delete('/delArticle', (req, res, next) => {
  let id = req.query.id;
  Articles.update({'_id': id}, {$set: {'del': 99}}, (err, doc) => {
    if (err) throw err;
    res.json({
      code: 200,
      msg: '删除成功',
      result: ''
    })
  })
});

// 获取分类
router.get('/getCategories', (req, res, next) => {
  Categories.find((err, doc) => {
    if (err) throw err;
    res.json({
      code: 200,
      msg: '',
      result: doc
    })
  });
});

// 创建文章
router.post('/createArticle', (req, res, next) => {
  let mdContent = req.body.mdContent,
    radomNum = parseInt(Math.random() * 9000 + 1000),
    createTime = parseInt(Date.parse(new Date()) / 1000),
    fileName = parseInt(`${radomNum}${createTime}`),
    // 文件保存路径
    filePath = `${process.cwd()}/public/articles/${fileName}.md`;
    data = {
      author: req.body.author,
      title: req.body.title,
      articlePath: `/articles/${fileName}.md`,
      createTime,
      tags: req.body.tags,
      category: req.body.cate,
      status: req.body.status,
      del: 0,
      readingAmounts: 0,
      comments: [],
      updateTime: createTime
    };
  // 写入文件
  fs.writeFile(filePath, mdContent, { encoding: 'utf-8' }, err => {
    if (err) throw err;
    Articles.create(data, (err, doc) => {
      if (err) throw err;
      resCb(res, 200, '保存成功');
    });
  });
});

// 图片上传
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
      let timestamp = Date.parse(new Date()) / 1000;
      let imgName = `img${timestamp}.${files.image.name.split('.')[1]}`;
      // 图片在服务器完整地址
      let showPath = `${process.cwd()}/public/imgs/${imgName}`;
      fs.rename(files.image.path, showPath, (err) => {
        if (err) throw err;
        let result = {
          imgUrl: `/imgs/${imgName}`
        };
        resCb(res, 200, '上传成功', result);
      });
    }
  });
});

// 根据文章id获取文章
router.get('/previewArticle', (req, res, next) => {
  let id = req.query.id
  Articles.find({'_id': id}, (err, doc) => {
    if (err) throw err;
    let filePath = `${process.cwd()}/public${doc[0].articlePath}`;
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) throw err;
      res.json({
        code: 200,
        msg: 'success',
        result: {
          content: data,
          article: doc[0]
        }
      })
    });
  });
});

// 编辑文章
router.put('/editArticle', (req, res, next) => {
  let id = req.body.id,
    content = req.body.mdContent;
  Articles.find({'_id': id}, (err, doc) => {
    if (err) throw err;
    let filePath = `${process.cwd()}/public${doc[0].articlePath}`,
      // 修改时间
      updateTime = parseInt(Date.parse(new Date()) / 1000);
    fs.writeFile(filePath, content, { encoding: 'utf-8' }, err => {
      if (err) throw err;
      let data = {
        title: req.body.title,
        author: req.body.author,
        category: req.body.cate,
        status: req.body.status,
        tags: req.body.tags,
        updateTime
      };
      Articles.update({'_id': id}, {$set: data}, (err, doc2) => {
        if (err) throw err;
        resCb(res, 200, 'success');
      });
    });
  });
});

module.exports = router;
