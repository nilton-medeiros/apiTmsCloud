const { AuthNuvemFiscal } = require('../../nuvemFiscal/AuthNuvemFiscal');
const saveLog = require('../../utils/saveLog');
const mysql = require('mysql2/promise');

require('dotenv').config();

async function obterToken() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_SY_DB,
        password: process.env.MYSQL_SY_PW,
        database: process.env.MYSQL_SY_DB
    });

    const authToken = {
        authorized: false,
        token: '',
        status: 400,
        error: {},
    };

    const NVFS_UID = process.env.NUVEMFISCAL_UID;
    let sql = 'SELECT value AS token, expires_in FROM key_value WHERE id = ?';

    try {
        const [rows] = await pool.execute(sql, [NVFS_UID]);
        const token = rows[0].token;
        const expireIn = rows[0].expires_in;
        const currDate = new Date();

        if (expireIn > currDate && token) {
            authToken.token = token;
            authToken.authorized = true;
            saveLog('Obteve o token da Nuvemfiscal via banco de dados');
            return authToken;
        }

        const auth = new AuthNuvemFiscal();
        authToken.token = await auth.newToken();

        if (auth.authorized) {

            sql = 'UPDATE key_value SET value = ?, expires_in = ? WHERE id = ?';

            try {
                const [result] = await pool.execute(sql, [auth.token, auth.expires_in, NVFS_UID]);
                console.log('obterToken', result);
                authToken.status = auth.status;
                authToken.token = auth.token;
                authToken.authorized = true;
                saveLog('Atualizou o token da Nuvemfiscal no banco de dados');
            } catch (err) {
                authToken.status = 400;
                authToken.error = err;
                console.error('ERRO SQL:', err);
                saveLog(err);
            }
        } else {
            authToken.status = auth.status;
            authToken.error = auth.error;
            saveLog({
                status: auth.status,
                error: auth.error,
                message: 'Token da Nuvemfiscal não foi autorizado',
            });
        }

    } catch (err) {
        console.error('ERRO SQL:', err);
        saveLog(err);
        authToken.status = 400;
        authToken.error = err;
    }

    return authToken;
}
exports.obterToken = obterToken;
