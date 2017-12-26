let express = require('express');
let router = express.Router();
let fs = require('fs');
let multiparty = require('multiparty');
let util = require('util');

// demo 创建文件并写入数据 & 读取文件内容返回
router.post('/uploadText', (req, res, next) => {
  let text = req.body.text;
  let filename = `text${Date.parse(new Date()) / 1000}`
  let filePath = `${process.cwd()}/public/articles/${filename}.txt`
  fs.writeFile(filePath, text, {
    encoding: 'utf-8'
  }, err => {
    if (err) throw err;
    
    fs.readFile(filePath, (err, data) => {
      if (err) throw err;
      res.json({
        code: 200,
        msg: 'success',
        result: `你刚写入的文件内容是${data}`
      });
    })
  })
});

// demo 上传图片
router.post('/uploadImg', (req, res, next) => {
  // 生成multiparty对象，并配置上传目标路径
  let form = new multiparty.Form({uploadDir: `${process.cwd()}/public/tmp/`});
  // 上传完成后的处理
  form.parse(req, (err, fields, files) => {
    let filesTmp = JSON.stringify(files, null, 2);

    if (err) throw err;
    let inputFile = files.inputFile;
    let uploadPath = inputFile.path;
    let target_path = `${process.cwd()}/public/imgs/${inputFile.originalFilename}`;
    // 重命名真实文件名
    fs.rename(uploadPath, target_path, err => {
      if (err) throw err;
      res.json({
        code: 200,
        msg: '',
        result: ''
      })
    });
  })
});

module.exports = router;

