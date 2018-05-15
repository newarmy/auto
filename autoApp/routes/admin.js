var express = require('express');
var http = require('http');
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var data = require('../data/auto');
var brandDB = require('../models/brandDB');
var router = express.Router();

/* render list. */
router.get('/brand', function(req, res, next) {
  res.render('brand');
});
router.get('/subBrand', function(req, res, next) {
  res.render('subbrand');
});
//设置品牌基本信息
router.get('/setbrand', function (req, res, next) {
	var brandArr = parseBrands(data);
	brandDB.savebrands(brandArr, function() {
		res.end('insert brand completed!!!');
	})
});
//下载品牌logo并设置品牌logo字段
router.get('/setbrandLogo', function(req, res, next) {
	var brandArr = parseBrands(data);
    downloadLogo(brandArr, 'sohuId', 'brand', function () {
    	res.end('download image finished!!!');
    });
   
});


router.get('/setSubBrand', function (req, res, next) {
	var subBrandArr = parseSubBrands(data);
	brandDB.saveSubBrands(subBrandArr, function() {
		res.end('all subbrands were inserted into database!!!');
	});
});
router.get('/setSubBrandLogo', function (req, res, next) {
    var subBrandArr = parseSubBrands(data);
    downloadLogo(subBrandArr, 'sohuId', 'sub-brand', function () {
        res.end('download subbrand image finished!!!');
    });
});

router.get('/models', function (req, res, next) {
    var modelArr = parseModels(data);
    brandDB.saveModels(modelArr, function() {
        res.end('all models were inserted into database!!!');
    });
});
router.post('/updateModels', function (req, res, next) {
    var body = req.body;
    console.log(body);
    brandDB.updateModels(body, function (err) {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
      if(err) {
      	console.log(JSON.stringify(err));
          res.json({status: err.message});
	  } else {
          res.json({status: 'success'});
	  }

	});
});


router.get('/trims', function (req, res, next) {
    var modelArr = parseModels(data);
    console.log('-------------------------------------------------------------');
    downTrimsData(modelArr, function() {
        res.end('all trims were inserted into database!!!');
	});
});

let trimIndex = 0;
// 下载车款数据
function downTrimsData (modelArr, cb) {
	let obj = modelArr[trimIndex];
	var opt = {
        hostname: 'db.auto.sohu.com',
        port: 80,
        path: '/api/model/select/trims_'+obj.sohuId+'.json',
        headers: {
         'Content-Type': 'application/json; charset=UTF-8'
        }
    };
	http.get(opt, (res) => {
		let encoding = res.headers['content-encoding'];
       //res.setEncoding('utf8');
       let rawData = [];

       res.on('data', (chunk) => {
           rawData.push(chunk);
	   })

		res.on('end', () => {
            let buf = Buffer.concat(rawData);
            console.log(buf);
			zlib.unzip(buf, function (err, decoded) {
				if(err) {
					console.log(err);
					return;
				}
               let data = decoded.toString();
               console.log(data);
               let parsedTrimsData = JSON.parse(data);
                let destArr = parseTrims(parsedTrimsData);
                brandDB.saveTrims(destArr, function () {
                    trimIndex++;
                    if(trimIndex === modelArr.length) {
                        return;
                    }
                    downTrimsData(modelArr, cb);
                });
			});

		})

	}).on('error', (e) => {
		console.log(`error: ${e.message}`);
	})
}


function parseTrims(srcData) {
   var mid = srcData.mid;
   var tArr = srcData.trimyears;
   var destArr = [];
   if(!tArr) {
   	return destArr;
   }
    tArr.forEach(function(obj, i, ownerArr) {
    	var year = obj.y;
    	var trimsArr = obj.trims;
    	trimsArr.forEach(function (v, j, array) {
    		var o = {};
    		o.name = v.tname;
    		o.mId = mid;
    		o.year = year;
    		o.price = v.price;
    		o.sohuId = v.tid;
    		o.status = v.status;
    		destArr.push(o);
		})
	})

	return destArr;
}


//下载logo并保存，更新数据库
function downloadLogo(arr, param, type, callback) {
	var size = arr.length;
	var index = 0;
	
   function getImage(bid) {
   	   var logoUrl = getLogoUrl(bid);
   	   console.log(logoUrl);
		http.get(logoUrl, function(res){
			var imgData = "";
			////一定要设置response的编码为binary否则会下载下来的图片打不开
			res.setEncoding('binary');
			res.on('data', function(chunk) {
				imgData +=chunk;
			});
			res.on('end', function() {
                var logoPath;
				if(type === 'brand') {
                    logoPath = path.resolve(__dirname, '../public/logo/'+bid+'.png')
				} else if(type === 'sub-brand'){
					logoPath = path.resolve(__dirname, '../public/subBrandlogo/'+bid+'.png')
				}

				fs.writeFile(logoPath, imgData, 'binary', function(err) {
					if(err) {
						console.log('download error : '+err);
						return;
					}
					index++;
					console.log('download success !!!');
                    if(type === 'brand') {
                        brandDB.updateLogo('logo/'+bid+'.png', bid, function() {
                            if(index == size) {
                                callback();
                                return;
                            }
                            setTimeout(function() {
                                getImage(arr[index][param]);
                            }, 100);
                        });
					} else if(type === 'sub-brand') {
                        brandDB.updateSubBrandLogo('subBrandlogo/'+bid+'.png', bid, function() {
                            if(index == size) {
                                callback();
                                return;
                            }
                            setTimeout(function() {
                                getImage(arr[index][param]);
                            }, 100);
                        });
					}

				});
			});
		}) ;
   }
   getImage(arr[index][param]);
}
function getLogoUrl (bid) {
	var random = Math.ceil(Math.random()*4);
	console.log('random : ' + random);
	return 'http://m'+random+'.auto.itc.cn/c_zoom,w_100,h_100/logo/brand/'+bid+'.png';
}

//解析子品牌
function parseSubBrands(data) {
	var resArr = [];
	var bds = data[0].brandlist;
	bds.forEach(function (bo, i) {
		bo.list.forEach(function (b) {
			var bid = b.i;
			b.s.forEach(function (sb) {
				resArr.push({
					sohuId: sb.i,
					name: sb.n,
					pinyin: sb.d,
					bid: bid,
					logo: 'logo/'+bid+'.png'
				});
			});
		});
	});
	return resArr;
}
//解析品牌
function parseBrands(data) {
	var resArr = [];
	var brand = data[0].brandlist;
	brand.forEach(function (bobj,i) {
		bobj.list.forEach(function (obj) {
			resArr.push({
				sohuId: obj.i,
				name: obj.n,
				pinyin: obj.d
			});
		});
	});
	return resArr;
}
//解析车型
function parseModels(data) {
    var resArr = [];
    var bds = data[0].brandlist;
    bds.forEach(function (bo, i) {
        bo.list.forEach(function (b) {
            var bid = b.i;
            b.s.forEach(function (sb) {
            	var sbid = sb.i;
                sb.b.forEach(function (m) {
                	resArr.push({
                        name: m.n,
						sohuId: m.i,
						bid: bid,
                        subBrandId: sbid,
                        pinyin: m.n,
                        maxprice: '0',
                        minprice: '0'
					});
				});
            });
        });
    });
    return resArr;
}
module.exports = router;
