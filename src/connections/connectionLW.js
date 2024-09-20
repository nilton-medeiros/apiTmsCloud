const mysql = require('mysql2/promise');
require('dotenv').config();

const connectionLW = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_LW_DB,
  password: process.env.MYSQL_DB_PW,
  database: process.env.MYSQL_LW_DB,
  decimalNumbers: true,
});

module.exports = connectionLW;
