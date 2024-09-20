async function getModal(pool, cteId, tpModal) {

  if (tpModal === 1) {
    return await getRodoModal(pool, cteId);
  }

  return await getAereoModal(pool, cteId);
}

async function getRodoModal(pool, cteId) {
  const occ = [];

  let sql = 'SELECT ';
  sql += 'oca_serie AS serie, ';
  sql += 'oca_numero AS nOcc, ';
  sql += 'oca_data_emissao AS dEmi, ';
  sql += 'oca_cnpj_emitente AS CNPJ, ';
  sql += 'oca_inscricao_estadual AS IE, ';
  sql += 'oca_uf_ie AS UF ';
  sql += 'FROM ctes_rod_coletas ';
  sql += `WHERE cte_id = ${cteId} `;
  sql += 'ORDER BY oca_data_emissao';

  const connection = await pool.getConnection();

  // console.log("ctes_rod_coletas: Obtendo Informações do Rodo Modal...")
  // console.log(sql)
  const [coletas] = await connection.query(sql);

  if (coletas.length > 0) {
    for (const coleta of coletas) {
      occ.push({
        serie: coleta.serie || '',
        nOcc: coleta.nOcc,
        dEmi: coleta.dEmi,
        CNPJ: coleta.CNPJ,
        IE: coleta.IE,
        UF: coleta.UF,
      });
    }
  }

  connection.release();
  return occ;
}

async function getAereoModal(pool, cteId) {
  const cubagem = {};

  let sql = 'SELECT ';
  sql += 'FORMAT(cte_dim_cumprimento * 100, 0) AS cumprimento, ';
  sql += 'FORMAT(cte_dim_altura * 100, 0) AS altura, ';
  sql += 'FORMAT(cte_dim_largura * 100, 0) AS largura, ';
  sql += 'cte_dim_cubagem_m3 ';
  sql += 'FROM ctes_dimensoes ';
  sql += `WHERE cte_id = ${cteId} `;
  sql += 'ORDER BY cte_dim_cubagem_m3 DESC LIMIT 1';

  const connection = await pool.getConnection();

  console.log("Obtendo Dimensões da carga se houver...")
  console.log(sql)
  const [dim] = await connection.query(sql);

  if (dim.length === 1) {
    const cump = dim[0].cumprimento.padStart(4, '0');
    const altu = dim[0].altura.padStart(4, '0');
    const larg = dim[0].largura.padStart(4, '0');
    cubagem.xDime = cump + 'X' + altu + 'X' + larg;
    cubagem.cInfManu = ['99'];
  }

  connection.release();
  return cubagem;
}

module.exports = getModal;
