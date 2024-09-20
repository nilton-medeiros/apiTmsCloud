const saveLog = require('../../shared/saveLog');
const mysql = require('mysql2/promise');

require('dotenv').config();

async function dbGetCTe(referencia_uid) {
  const error = { statusError: 0, msg: '' };
  const cia = referencia_uid.slice(0, 2);

  // Database connection
  const dbHost = process.env.MYSQL_HOST;
  const dbPassword = process.env.MYSQL_DB_PW;
  let dbUser, dbName;

  if (cia === 'ap') {
    dbUser = process.env.MYSQL_AP_DB;
  } else if (cia === 'lw') {
    dbUser = process.env.MYSQL_LW_DB;
  }

  dbName = dbUser;

  if (dbUser === undefined) {
    saveLog({
      level: 'cteModel.js - LOG1',
      message: 'Variável "dbUser" é "undefined" porque a var "cia" não é "ap" e nem "lw"',
    });

    error.statusError = 500;
    error.msg = 'Internal Server Error';

    return error;
  }

  const pool = mysql.createPool({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    decimalNumbers: true,
  });

  const connection = await pool.getConnection();

  try {
    // Consulta um CTe por referencia_uid. Pela referencia se obtem qual é o agente/db (LW ou AP)
    const sql = `
      SELECT
        cte_id AS id,
        cte_tipo_doc_anexo AS tipo_doc_anexo,
        cte_modal AS tpModal
      FROM ctes
      WHERE referencia_uuid = '${referencia_uid}'
    `;

    const [rows] = await connection.query(sql);

    // console.log('sql:', sql);

    if (rows.length > 0) {
      // Retorna o primeiro registro (CTe) encontrado
      const row = rows[0];
      row.pool = pool;

      return row;
    } else {
      const msg = `CTe não encontrado. referencia_uid: ${referencia_uid}`;
      error.statusError = 400;
      error.msg = msg;

      saveLog({ level: 'cteModel.js - LOG2', message: msg });
    }
  } catch (err) {
    // console.log(err);

    error.statusError = 500;
    error.msg = 'Internal Server Error';

    saveLog({
      level: 'cteModel.js - LOG3',
      message: 'Erro ao executar query no banco de dados: ' + err,
    });
  } finally {
    connection.release();
  }

  return error;
}

module.exports = dbGetCTe;
