const mysql = require('mysql2/promise');
require('dotenv').config();

const connectionAP = mysql.createConnection({
    host: process.env.MYSQL_AP_HOST,
    user: process.env.MYSQL_AP_DB,
    password: process.env.MYSQL_AP_PASSWORD,
    database: process.env.MYSQL_AP_DB
});

module.exports = connectionAP;
