const saveLog = require('../../shared/saveLog');

async function dbGetIcms(pool, ufOrigem, ufDestino) {
  const sql = `
    SELECT
      uf_origem,
      uf_${ufDestino} as aliquota
    FROM icms
    WHERE uf_origem IN ('${ufOrigem}', '${ufDestino}')
    LIMIT 2
  `;

  const connection = await pool.getConnection();
  const [rows] = await connection.query(sql);

  connection.release();

  let aliqIni = 0;
  let aliqFim = 0;

  if (rows.length === 2) {
    aliqIni = ufOrigem === rows[0].uf_origem ? rows[0].aliquota : rows[1].aliquota;
    aliqFim = ufOrigem === rows[0].uf_origem ? rows[1].aliquota : rows[0].aliquota;
  } else {
    saveLog({
      level: 'icmsModel - LOG1',
      message: 'Consulta à tabela icms não retornou dois registros necessários',
      meta: {sql: sql, rows: rows},
    });
  }

  return { aliqIni: aliqIni, aliqFim: aliqFim };
}

module.exports = dbGetIcms;
