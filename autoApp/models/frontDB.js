var mysql = require('mysql');
var conn = null;
function createConn() {
	var conn =   mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'auto',
        port: '3306'
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


function searchAllBrands(callback) {
    if(!conn) {
        conn = createConn();
    }
    let sql = 'SELECT `name`,`logo`,`sohuId` FROM `brand`';
    conn.query(sql, function (err, results, fields) {
        //console.log(results);
        callback(err, results, fields);
    })
}
function searchBrandBySohuId(sohuId, callback) {
    if(!conn) {
        conn = createConn();
    }
    let columns = ['name', 'logo'];
    let sql = 'SELECT ?? FROM ?? WHERE sohuId = ?';
    conn.query(sql, [columns, 'brand', sohuId], function (err, results, fields) {
        //console.log(results);
        callback(err, results, fields);
    })
}

function searchSubBrandBySohuId(sohuId, callback) {
    if(!conn) {
        conn = createConn();
    }
    let columns = ['name', 'sohuId'];
    let sql = 'SELECT ?? FROM ?? WHERE bid = ?';
    conn.query(sql, [columns, 'subbrand', sohuId], function (err, results, fields) {
        //console.log(results);
        callback(err, results, fields);
    })
}

function searchModelsBySohuId(sohuId, callback) {
    if(!conn) {
        conn = createConn();
    }
    let columns = ['name','image', 'minprice', 'maxprice', 'subBrandId', 'sohuId'];
    let sql = 'SELECT ?? FROM ?? WHERE bid = ?';
    conn.query(sql, [columns, 'models', sohuId], function (err, results, fields) {
        callback(err, results, fields);
    })
}



function searchModelById(mid, callback) {
    if(!conn) {
        conn = createConn();
    }
    let columns = ['name','image', 'minprice', 'maxprice', 'level', 'oil', 'biansuxiang', 'struct', 'baoxiu'];
    let sql = 'SELECT ?? FROM ?? WHERE sohuId = ?';
    conn.query(sql, [columns, 'models', mid], function (err, results, fields) {
        callback(err, results, fields);
    })
}
function searchTrimsByMid(mid, callback) {
    if(!conn) {
        conn = createConn();
    }
    let columns = ['name','year', 'price'];
    let sql = 'SELECT ?? FROM ?? WHERE mId = ?';
    conn.query(sql, [columns, 'trims', mid], function (err, results, fields) {
        callback(err, results, fields);
    })
}

module.exports = {
    searchAllBrands: searchAllBrands,
    searchBrandBySohuId: searchBrandBySohuId,
    searchSubBrandBySohuId: searchSubBrandBySohuId,
    searchModelsBySohuId: searchModelsBySohuId,
    searchModelById: searchModelById,
    searchTrimsByMid: searchTrimsByMid
};