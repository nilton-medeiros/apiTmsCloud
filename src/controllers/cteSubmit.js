const { ApiCTe } = require('../nuvemFiscal/ApiCTe');

const saveLog = require('../shared/saveLog');

async function cteSubmit(anexosCTe) {
  const id = anexosCTe.id;
  const pool = anexosCTe.pool;

  let row;
  msgLog = null;
  let sql = `SELECT * FROM view_ctes_sefaz WHERE cte_id = ${id}`;

  const connection = await pool.getConnection();

  try {
    // console.log('');
    // console.log(`Obtendo Informações da "view_ctes_sefaz" sobre o cte_id = ${id}...`);
    // console.log(sql);
    // console.log('');
    const [rows] = await connection.query(sql);

    if (rows && rows.length > 0) {
      row = rows[0];
    } else {
      msgLog = `CTe id ${id} não encontrado.`;
    }
  } catch (err) {
    // console.log('ERRO SQL:', sql);
    msgLog = 'Error SQL: ' + sql;

    // console.log('error:', err);
  }

  if (msgLog) {
    saveLog({
      level: 'cteSubmit.js - LOG1',
      message: msgLog,
    });
  }

  saveLog({ level: 'cteSubmit.js - LOG2', message: 'Análise cte row', meta: row });

  const cte = {
    ...row,
    anexos: anexosCTe.anexos,
    authToken: anexosCTe.authToken,
    pool: pool,
    modal: anexosCTe.modal,
  };

  // Falta terminiar a classe ApiCTe
  const apicte = new ApiCTe(cte);

  connection.release();
}

module.exports = cteSubmit;
