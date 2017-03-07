var mysql = require('mysql');
var conn = null;
function createConn() {
	var conn =   mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'auto'
	});
	conn.connect(function(err) {
		if(err) {
			console.error('error connecting: ' + err.stack);
			return;
		}
		console.log('connected as id '+conn.threadId);
	});
	return conn;
};

function save(table, obj, callback) {
    if(!conn) {
    	conn = createConn();
    }
    var query = conn.query('INSERT INTO '+ table +' SET ?', obj, function(error, results, fields) {
    	callback(error, results, fields);
    });
    console.log('-----------'+query.sql+'----------------');
};
function update(table, obj, cb) {

}



function updateLogo(url, bid, cb) {
   if(!conn) {
   		conn = createConn();
   }
   conn.query('UPDATE brand SET logo = ? where sohuId = ?', [url, bid], function(err, results, fields) {
      if (err) throw err;
  		console.log('changed ' + results.changedRows + ' rows');
  		cb();
   });
}
// ----------插入brands----------------
var brandSize = 0;
var brandIndex = 0;
var brandArr = null;
var brandCallback =null;
function savebrands(arr, cb) {
	brandSize = arr.length;
	brandArr = arr;
	brandCallback = cb;
	save('brand', arr[brandIndex], savebrandsCallback);
}
function savebrandsCallback(err, results, fields) {
	if(err) {
		console.log('insert error ----'+err);
		return;
	}
    brandIndex++;
    if(brandIndex == brandSize) {
    	console.log('insert done');
    	brandCallback();
    	return;
    }
    save('brand', brandArr[brandIndex], savebrandsCallback);
}
// ------------------插入subbrands--------------------
function saveSubBrands(arr, cb) {
	var sbrandSize = arr.length;
	var sbrandIndex = 0;
	function saveSubBrandsCallback(err, results, fields) {
		if(err) {
			console.log('insert error : '+ err);
			return;
		}
		sbrandIndex++;
		if(sbrandIndex == sbrandSize) {
			console.log('insert subbrand done');
			cb();
			return;
		}
		save('subbrand', arr[sbrandIndex], saveSubBrandsCallback);
	}
	save('subbrand', arr[sbrandIndex], saveSubBrandsCallback);
}

module.exports = {
	savebrands: savebrands,
	saveSubBrands: saveSubBrands,
	updateLogo: updateLogo
};