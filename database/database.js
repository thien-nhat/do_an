const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config({
	path: './config.env',
});
const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: 'do_an',
	timezone: 'Z',
});

connection.connect((err) => {
	if (err) throw err;
	console.log('Database Connected!');
});

module.exports = connection;
