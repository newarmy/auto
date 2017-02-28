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
// 插入brands
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

module.exports = {
	savebrands: savebrands
}