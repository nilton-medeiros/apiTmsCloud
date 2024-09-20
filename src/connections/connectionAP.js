const mysql = require('mysql2/promise');

require('dotenv').config();

const connectionAP = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_AP_DB,
  password: process.env.MYSQL_DB_PW,
  database: process.env.MYSQL_AP_DB,
  decimalNumbers: true,
});

module.exports = connectionAP;
