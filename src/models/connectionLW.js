const mysql = require('mysql2/promise');
require('dotenv').config();

const connectionLW = mysql.createConnection({
    host: process.env.MYSQL_LW_HOST,
    user: process.env.MYSQL_LW_DB,
    password: process.env.MYSQL_LW_PASSWORD,
    database: process.env.MYSQL_LW_DB
});

module.exports = connectionLW;
