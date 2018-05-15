var express = require('express');
var https = require('https');
var queryString = require('querystring');
var WXBizDataCrypt = require('../wx/WXBizDataCrypt');
var router = express.Router();
global.token = null;
/* 解密微信用户信息 */
router.post('/decode', function (req, res, next) {
    let body = req.body;
    console.log(req.cookie);
    let appid = 'wx3ad6f6089c4558fa';
    console.log('sid = '+body.sid, req.session, req.session[body.sid]);
    let sessionkey = req.session[body.sid].split("|||")[1];
    let encryptedData = body.encryptedData;
    let iv = body.iv;
    //
    let pc = new WXBizDataCrypt(appid, sessionkey);

    let data = pc.decryptData(encryptedData , iv);
    res.json(data);
});
// get session3rd
router.get('/login', (req, res, next) => {
    var query = req.query;
    var js_code = query.js_code;
    https.get('https://api.weixin.qq.com/sns/jscode2session?js_code='+js_code+'&grant_type=authorization_code&appid=wx3ad6f6089c4558fa&secret=8232ad5d7ea4735a4db303babc667202',
        (res1) => {

            var temp = '';
            res1.setEncoding('utf-8');
            res1.on('data', (d) => {
                temp +=d;
            });
            res1.on('end', function() {
                console.log(temp);
                 let result = JSON.parse(temp);
                 let session_key = result.session_key;
                 var openid = result.openid;
                 let session3rd = get3rdSession();
                 req.session[session3rd] = openid +"|||"+session_key;
                 console.log(req.session);
                 console.log(req.cookie);
                res.json({'status': 'success', 'sid': session3rd});
            })
        });
});
function get3rdSession() {
    //生成第三方3rd_session
    let session3rd  = '';
    let strPol = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
    let max = strPol.length;
    for(let i=0; i<16; i++){
        session3rd +=strPol[Math.round(Math.random(0,max))];
    }
    return session3rd;
}
router.get('/getWxToken', function(req, res, next) {
  // APPSECRET 8232ad5d7ea4735a4db303babc667202
    https.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx3ad6f6089c4558fa&secret=8232ad5d7ea4735a4db303babc667202',
        (res1) => {
           // console.log('状态码：', res1.statusCode);
            //console.log('请求头：', res1.headers);
            var temp = '';
                res1.setEncoding('utf-8');
            res1.on('data', (d) => {
               temp +=d;
            });
            res1.on('end', function() {
              console.log("Token = ", temp);
              global.token = JSON.parse(temp).access_token;
              res.json({'status': 'success'});
            })
        });
});
router.get('/getWxTemplate', (req, res, next) => {
    let json = req.query;
    console.log(json);
    let data = {
        "touser": json.touser,
        "template_id": json.template_id,
        "page": json.page,
        "form_id": json.form_id,
        "data": {
            "keyword1": {
                "value": "339208499",
                "color": "#173177"
            },
            "keyword2": {
                "value": "2015年01月05日 12:30",
                "color": "#173177"
            },
            "keyword3": {
                "value": "粤海喜来登酒店",
                "color": "#173177"
            }
        }
    };
    data = JSON.stringify(data);
    console.log(data);
    let option = {
        protocol: 'https:',
        hostname: 'api.weixin.qq.com',
        port: 443,
        path: '/cgi-bin/message/wxopen/template/send?access_token='+ global.token,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };
   let reqObj = https.request(option, function(resObj) {
       resObj.setEncoding('utf8');
       let result = '';
       resObj.on('data', (chunk) => {
           result += chunk;
       });
       resObj.on('end', () => {
           console.log('success = '+ result);
           res.end(result);
       });
   });
    reqObj.on('error', (e) => {
        console.error(`请求遇到问题: ${e.message}`);
        res.end({'status': 'error'});
    });
    reqObj.write(data);
    reqObj.end();
});
router.get('/form', (req, res, next) => {
  var query = req.query;
  if(query.name === 'test') {
    res.json({"status": "success"});
  } else {
    res.json({"status": "error"});
  }
});

router.post('/testJsonParser', (req, res, next) => {
    var json = req.body;
    res.json({msg: json.d});
});
module.exports = router;
