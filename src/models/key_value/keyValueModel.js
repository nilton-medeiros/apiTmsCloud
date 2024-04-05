const mysql = require('mysql2/promise');
require('dotenv').config();

async function obterToken() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_SY_DB,
        password: process.env.MYSQL_SY_PW,
        database: process.env.MYSQL_SY_DB,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    });

    const NVFS_UID = process.env.NUVEMFISCAL_UID;
    const sql = 'SELECT value AS token, expires_in FROM key_value WHERE id = ?';

    try {
        const [rows] = await pool.execute(sql, [NVFS_UID]);
        const expiraEm = rows[0].expires_in;
        const dataAtual = new Date();

        if (expiraEm > dataAtual) {
            console.log(`expiraEm: ${expiraEm} A data do banco é maior que a data atual ${dataAtual}`);
        } else if (expiraEm < dataAtual) {
            console.log(`A data do banco (${expiraEm}) é menor que a data atual (${dataAtual})`);
        } else {
            console.log(`A data do banco (${expiraEm}) é igual a data atual (${dataAtual})`);
        }

    } catch (err) {
        console.error('ERRO SQL:', err);
    }
}

module.exports = obterToken;
