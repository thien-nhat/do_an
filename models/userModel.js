const db = require('../database/database');
const bcrypt = require('bcryptjs');

// exports.logIn = (data, callback) => {
// 	// const id = Date.now().toString();
// 	// const { name, email, password, places, phone, role } = data;
// 	// const sql = `INSERT INTO users (id, name, email, password, places, phone,role) VALUES (?, ?, ?, ?, ?, ?, ?)`;

// 	// // db.query(sql, [id, name, email, password, places, phone, role], callback);
// 	// db.query(
// 	// 	sql,
// 	// 	[id, name, email, password, places, phone, role],
// 	// 	(err, result) => {
// 	// 		if (err) {
// 	// 			console.log(err);
// 	// 		} else {
// 	// 			callback(null, id, data);
// 	// 		}
// 	// 	}
// 	// );
// 	const { email, password } = data;
// 	const sql = 'SELECT * FROM users WHERE email = ?';
// 	db.query(sql, email, (err, result) => {
// 		if (err) {
// 			callback(err, null);
// 		} else {
// 			console.log(result.password, password);
// 			if (password == result[0].password) {
// 				callback(null, result[0].userId, result[0]);
// 			} else {
// 				callback(err, null);
// 			}
// 		}
// 	});
// };
exports.getAllUsers = (callback) => {
	const sql = 'SELECT * FROM users';
	db.query(sql, callback);
};

exports.getUserById = (id, callback) => {
	const sql = 'SELECT * FROM users WHERE id = ?';
	db.query(sql, [id], callback);
};

// exports.createUser = (data, callback) => {
// 	const id = Date.now().toString();
// 	const { name, email, password, places, phone, role } = data;
// 	const sql = `INSERT INTO users (id, name, email, password, places, phone,role) VALUES (?, ?, ?, ?, ?, ?, ?)`;

// 	// db.query(sql, [id, name, email, password, places, phone, role], callback);
// 	db.query(
// 		sql,
// 		[id, name, email, password, places, phone, role],
// 		(err, result) => {
// 			if (err) {
// 				console.log(err);
// 			} else {
// 				callback(null, id, data);
// 			}
// 		}
// 	);
// };

exports.updateUser = (id, user, callback) => {
	const { name, email, password, phone, places, role } = user;
	const sql = `UPDATE users SET name = ?, email = ?, password = ?, phone = ?, places = ?, role = ? WHERE id = ?`;
	db.query(sql, [name, email, password, phone, places, role, id], callback);
};

exports.deleteUser = (id, callback) => {
	const sql = 'DELETE FROM users WHERE id = ?';
	db.query(sql, [id], callback);
};

exports.createUser = async function (data) {
	return new Promise(async (resolve, reject) => {
		const id = Date.now().toString();
		let { name, email, password, places, phone, role } = data;
		const sql = `INSERT INTO users (id, name, email, password, places, phone,role) VALUES (?, ?, ?, ?, ?, ?, ?)`;
		password = await bcrypt.hash(password, 12);
		db.query(
			sql,
			[id, name, email, password, places, phone, role],
			(err, results) => {
				if (err) {
					reject(err);
				} else {
					resolve({ id, name, email, password, places, phone, role });
				}
			}
		);
	});
};

exports.findOneUser = function (email) {
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
					console.log("Password", data[key]);
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
