const db = require('../database/database');

exports.getAllData = ( page, limit, queryString, callback) => {
	let sql = 'SELECT * FROM data WHERE temperature != 0 AND humidity != 0 AND soilMoisture != 0';
	let params = [];

	// Filter by date range
	if (queryString.start && queryString.end) {
		sql += ' WHERE ts >= ? AND ts < ?';
		params.push(new Date(queryString.start), new Date(queryString.end));
	}
	// Filter by specific date
	else if (queryString.on) {
		let startDate = new Date(queryString.on);
		let endDate = new Date(queryString.on);
		endDate.setDate(endDate.getDate() + 1);
		sql += ' WHERE ts >= ? AND ts < ?';
		params.push(startDate, endDate);
	}

	// Sort by fields
	if (queryString.sort) {
		const sortBy = queryString.sort.split(',').join(' ');
		sql += ' ORDER BY ' + sortBy;
	} else {
		sql += ' ORDER BY ts DESC';
	}
	let offset = (page - 1) * limit;
	sql += ' LIMIT ?, ?';
	params.push(offset, limit);

	db.query(sql, params, callback);
};

exports.getCountData = (callback) => {
	let sql = 'SELECT COUNT(*) AS count FROM data WHERE temperature != 0 AND humidity != 0 AND soilMoisture != 0'; 

	db.query(sql, (err, result) => {
		if (err) throw err;
		callback(null, result[0].count);
	});
};
exports.getDataById = (id, callback) => {
	const sql = 'SELECT * FROM data WHERE id = ?';
	db.query(sql, [id], callback);
};

exports.createData = (data, callback) => {
	const { id, temperature, humidity, ts } = data;
	const sql = `INSERT INTO data (id, temperature, humidity, ts) VALUES (?, ?, ?, ?)`;
	db.query(sql, [id, temperature, humidity, ts], callback);
};

exports.updateData = (id, data, callback) => {
	const { temperature, humidity, ts } = data;
	const sql = `UPDATE data SET temperature = ?, humidity = ?, ts = ? WHERE id = ?`;
	db.query(sql, [temperature, humidity, ts, id], callback);
};

exports.deleteData = (id, callback) => {
	const sql = 'DELETE FROM data WHERE id = ?';
	db.query(sql, [id], callback);
};
