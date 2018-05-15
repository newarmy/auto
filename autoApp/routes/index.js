var express = require('express');
var router = express.Router();
var path = require('path');
var FDB = require('../models/frontDB');
var Freemarker = require('freemarker.js');
let concatData = require('../utils/concatData');

/* GET home page. */
router.get('/', function(req, res, next) {
    FDB.searchAllBrands(function (err, results, fields) {
        if(err) {
            console.log('--------------------------------------------');
          console.log(err);
          return;
        }
        console.log('yes');
        res.render('front/brandList', { title: '汽车品牌页', brandArr: results});
    });

});
/* -------------------- test ejs template ---------------------------------*/
router.get('/ejs', function(req, res, next) {
    FDB.searchAllBrands(function (err, results, fields) {
        if(err) {
            console.log(err);
            return;
        }
        console.log('yes');
        res.render('ejs/test', { title: '汽车品牌页', brandArr: results});
    });

});
/*------------------- node express 加载 freemarker模板显示， 测试使用 ---------------*/
router.get('/fm', function (req, res, next) {
    FDB.searchAllBrands(function (err, results, fields) {
        if(err) {
            return;
        }
        var fm = new Freemarker({
            viewRoot: path.join(__dirname, '../views/freemarker'),
            options: {}
        });
        fm.render('test.ftl', { title: '汽车品牌页', brandArr: results}, function(err, html, output) {
            console.log(html);
            console.log(output);

            res.set('Content-Type', 'text/html');
            res.send(html);
        });
    });
});
router.get('/brand/:bid', function (req, res, next) {
   let bid = req.params.bid;
   let brandObj = null;
   let subBrandData = null;
   let modelData = null;
   let subBrandList = null;
   let modelList = null;
   FDB.searchBrandBySohuId(bid, function (err, results, fields) {
       brandObj = results[0];
       if(brandObj && subBrandData && modelData) {
         let resultObj = concatData(subBrandData, modelData);
         subBrandList = resultObj.slist;
         modelList = resultObj.mlist;
         res.render('front/brand', {'title':brandObj.name, brandObj:brandObj, modelList: modelList, subBrandList: subBrandList})
       }
   });
    FDB.searchSubBrandBySohuId(bid, function (err, results, fields) {
        subBrandData = results;
        if(brandObj && subBrandData && modelData) {
            let resultObj = concatData(subBrandData, modelData);
            subBrandList = resultObj.slist;
            modelList = resultObj.mlist;
            res.render('front/brand', {'title':brandObj.name, brandObj:brandObj, modelList: modelList, subBrandList: subBrandList})
        }
    });
    FDB.searchModelsBySohuId(bid, function (err, results, fields) {
        modelData = results;
        if(brandObj && subBrandData && modelData) {
            let resultObj = concatData(subBrandData, modelData);
            subBrandList = resultObj.slist;
            modelList = resultObj.mlist;
            res.render('front/brand', {'title':brandObj.name, brandObj:brandObj, modelList: modelList, subBrandList: subBrandList})
        }
    });

});

router.get('/model/:mid', function (req, res, next) {
    let mid = req.params.mid;
    let modelObj = null;
    let trimsList = null;
    FDB.searchModelById(mid, function (err, results, fields) {
        if(err) {
            console.log(err);
            return;
        }
        modelObj = results[0];
        if(modelObj && trimsList) {
          res.render('front/model', {'title':modelObj.name, modelObj:modelObj,trimList: trimsList})
        }
    });
    FDB.searchTrimsByMid(mid, function (err, results, fields) {
        if(err) {
            console.log(err);
            return;
        }
        trimsList = results;
        if(modelObj && trimsList) {
            res.render('front/model', {'title':modelObj.name, modelObj:modelObj,trimList: trimsList})
        }
    })
});

module.exports = router;
