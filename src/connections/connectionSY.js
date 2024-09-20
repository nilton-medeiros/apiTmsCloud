const mysql = require('mysql2/promise');
require('dotenv').config();

const connectionSY = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_SY_DB,
  password: process.env.MYSQL_SY_PW,
  database: process.env.MYSQL_SY_DB,
  decimalNumbers: true,
});

module.exports = connectionSY;
