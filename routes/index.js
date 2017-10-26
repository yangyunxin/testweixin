var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const jssdk = require('../libs/jssdk');

/* GET home page. */
router.get('/wechat/hello', function(req, res, next) {
  jssdk.getSignPackage(`http://yehuanhuan.applinzi.com${req.url}`, function (err, signPackage) {
    if (err) {
      return next(err);
    }

    res.render('index', { 
      title: 'hello wechat',
      signPackage: signPackage,
      pretty: true,
    });
  })

});

const token = "weixin";
const handle = function (req, res, next) {
const { signature, timestamp, nonce, echostr } = req.query;
  if (!signature || !timestamp || !nonce) {
    return res.send('invalid request');
  }
  if (req.method === 'POST') {
	console.log('post');
    console.log('handle.post:', { body: req.body, query:req.query });
  }
  if (req.method === 'GET') {  
    console.log('handle.get', { get: req.body })
    if (!echostr) {
      return res.send('invalid request');
    }
  }
  // sort
  const params = [token, timestamp, nonce];
  params.sort();

  // sha1 
  const hash = crypto.createHash('sha1');
  const sign = hash.update(params.join('')).digest('hex');

  // test
  if (signature === sign) {
    res.send(echostr);
  } else {
    res.send('invalid sign');
  }
}
router.get('/wechat/verify', handle);
router.post('/wechat/verify', handle);
module.exports = router;
