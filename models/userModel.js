const db = require('../database/database');
const bcrypt = require('bcryptjs');

exports.getAllUsers = (callback) => {
	const sql = 'SELECT * FROM users';
	db.query(sql, callback);
};

exports.getUserById = (id, callback) => {
	const sql = 'SELECT * FROM users WHERE id = ?';
	db.query(sql, [id], callback);
};


exports.updateUser = (id, user, callback) => {
	const { name, email, password,  role } = user;
	const sql = `UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?`;
	db.query(sql, [name, email, password,  role, id], callback);
};

exports.deleteUser = (id, callback) => {
	const sql = 'DELETE FROM users WHERE id = ?';
	db.query(sql, [id], callback);
};


exports.findByEmail = function (email) {
	return new Promise((resolve, reject) => {
		const sql = `SELECT * FROM users WHERE email = ?`;

		db.query(sql, [email], (err, results) => {
			if (err) {
				reject(err);
			} else {
				resolve(results[0]);
			}
		});
	});
};
exports.findById = function (id) {
	return new Promise((resolve, reject) => {
		const sql = `SELECT * FROM users WHERE id = ?`;

		db.query(sql, [id], (err, results) => {
			if (err) {
				reject(err);
			} else {
				resolve(results[0]);
			}
		});
	});
};

exports.correctPassword = function (providedPassword, hashedPassword) {
	return new Promise((resolve, reject) => {
		bcrypt.compare(providedPassword, hashedPassword, function (err, isMatch) {
			if (err) {
				reject(err);
			} else {
				resolve(isMatch);
			}
		});
	});
};
exports.changePasswordAfter = function (user, JWTTimestamp) {
	return new Promise((resolve, reject) => {
		if (user.passwordChangeAt) {
			const changedTimestamp = parseInt(
				user.passwordChangeAt.getTime() / 1000,
				10
			);
			resolve(JWTTimestamp < changedTimestamp);
		} else {
			resolve(false);
		}
	});
};

exports.findByIdAndUpdate = async function (id, data) {
	return new Promise(async (resolve, reject) => {
		let sql = 'UPDATE users SET ';
		let updates = [];
		for (let key in data) {
			if (data.hasOwnProperty(key)) {
				if (key == 'password') {
					console.log('Password', data[key]);
					data[key] = await bcrypt.hash(data[key], 12);
				}
				sql += `${key} = ?, `;
				updates.push(data[key]);
			}
		}
		sql = sql.slice(0, -2); // remove the last comma and space
		sql += ' WHERE id = ?';
		updates.push(id);

		db.query(sql, updates, (err, results) => {
			if (err) {
				reject(err);
			} else {
				resolve({ id, ...data });
			}
		});
	});
};
exports.updateVerifyCode = async function (verifyNumber, email) {
	var sql = 'UPDATE users SET verifyCode = ? WHERE email = ?';
	// Wrap the query inside a new Promise
	return new Promise((resolve, reject) => {
		db.query(sql, [verifyNumber, email], function (err, result) {
			if (err) {
				// If there's an error, reject the Promise
				reject(err);
			} else {
				// If everything went fine, resolve the Promise
				resolve(result);
			}
		});
	});
};
exports.updatePassword = async function (verifyNumber, email, password) {
	password = await bcrypt.hash(password, 12);
	console.log(verifyNumber);
	var sql = 'UPDATE users SET password = ? WHERE email = ? AND verifyCode = ?';
	// Wrap the query inside a new Promise
	return new Promise((resolve, reject) => {
		db.query(sql, [password, email, verifyNumber], function (err, result) {
			if (err) {
				// If there's an error, reject the Promise
				reject(err);
			} else {
				// If everything went fine, resolve the Promise
				resolve(result);
			}
		});
	});
};
