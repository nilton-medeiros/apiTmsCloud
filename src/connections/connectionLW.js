const mysql = require('mysql2/promise');
require('dotenv').config();

const connectionLW = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_LW_DB,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_LW_DB
});

module.exports = connectionLW;
