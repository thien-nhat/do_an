const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'do_an'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Database Connected!');
});

module.exports = connection;
