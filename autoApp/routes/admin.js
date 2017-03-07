var express = require('express');
var http = require('http');
var fs = require('fs');
var path = require('path');
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
    downloadLogo(brandArr, function () {
    	res.end('download image finished!!!');
    });
   
});


router.get('/setSubBrand', function (req, res, next) {
	var subBrandArr = parseSubBrands(data);
	brandDB.saveSubBrands(subBrandArr, function() {
		res.end('all subbrands were inserted into database!!!');
	});
});

//下载logo并保存，更新数据库
function downloadLogo(arr, callback) {
	var size = arr.length;
	var index = 0;
	
   function getImage(bid) {
   	   var logoUrl = getLogoUrl(bid);
		http.get(logoUrl, function(res){
			var imgData = "";
			////一定要设置response的编码为binary否则会下载下来的图片打不开
			res.setEncoding('binary');
			res.on('data', function(chunk) {
				imgData +=chunk;
			});
			res.on('end', function() {
				var logoPath = path.resolve(__dirname, '../public/logo/'+bid+'.png')
				fs.writeFile(logoPath, imgData, 'binary', function(err) {
					if(err) {
						console.log('download error : '+err);
						return;
					}
					index++;
					console.log('download success !!!');

					brandDB.updateLogo('logo/'+bid+'.png', bid, function() {
						if(index == size) {
							callback();
							return;
						}
						setTimeout(function() {
							getImage(arr[index].sohuId);
						}, 3000); 
					});
				});
			});
		}) ;
   }
   getImage(arr[index].sohuId);
}
function getLogoUrl (bid) {
	var random = Math.floor(Math.random()*3);
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
					bid: bid
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

module.exports = router;
