const { AuthNuvemFiscal } = require('../../nuvemFiscal/AuthNuvemFiscal');
const saveLog = require('../../shared/saveLog');
const mysql = require('mysql2/promise');

require('dotenv').config();

async function obterToken() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_SY_DB,
    password: process.env.MYSQL_SY_PW,
    database: process.env.MYSQL_SY_DB,
    decimalNumbers: true,
  });

  const authToken = {
    authorized: false,
    token: '',
    status: 400,
    error: {},
  };

  const NVFS_UID = process.env.NUVEMFISCAL_UID;
  let sql = `SELECT value AS token, expires_in FROM key_value WHERE id = '${NVFS_UID}'`;

  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(sql);
    const token = rows[0].token;
    const expireIn = rows[0].expires_in;
    const currDate = new Date();

    if (expireIn > currDate && token) {
      authToken.token = token;
      authToken.authorized = true;
      authToken.status = 200;
      saveLog({
        level: 'obterToken.js - LOG1',
        message: 'Token Nuvemfiscal obtido via banco de dados',
      });

      return authToken;
    }

    // Token expired

    const auth = new AuthNuvemFiscal();
    authToken.token = await auth.newToken();

    if (auth.authorized) {
      sql = `UPDATE key_value SET value = '${auth.token}', expires_in = '${auth.expires_in}' WHERE id = '${NVFS_UID}'`;

      try {
        // Atualiza tabela key_value no banco de dados
        const [result] = await connection.query(sql);

        saveLog({
          level: 'obterToken.js - LOG2',
          message: 'Novo Token atualizado na tabela key_value no banco de dados',
          meta: result,
        });

        authToken.status = auth.status;
        authToken.token = auth.token;
        authToken.authorized = true;
      } catch (err) {
        authToken.status = 500;
        authToken.error = err;
        console.error('ERRO SQL:', err);
        saveLog({
          level: 'obterToken.js - LOG3',
          message: err,
          meta: sql,
        });
      } finally {
        connection.release();
      }
    } else {
      authToken.status = auth.status;
      authToken.error = auth.error;
      saveLog({
        level: 'obterToken.js - LOG4',
        message: 'Token da Nuvemfiscal não foi autorizado',
        meta: { status: auth.status, error: auth.error },
      });
    }
  } catch (err) {
    saveLog({ level: 'obterToken.js - LOG6', message: err });

    authToken.status = 500;
    authToken.error = err;
  } finally {
    connection.release();
  }

  return authToken;
}
exports.obterToken = obterToken;
