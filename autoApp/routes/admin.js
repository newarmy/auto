var express = require('express');
var path = require('path');
var data = require('../data/auto');
var brandDB = require('../models/brandDB');
var router = express.Router();

/* render list. */
router.get('/brand', function(req, res, next) {
  res.render('brand');
});
router.get('/setbrand', function (req, res, next) {
	var brandArr = parseBrands(data);
	brandDB.savebrands(brandArr, function() {
		res.end('insert brand completed!!!');
	})
});

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
