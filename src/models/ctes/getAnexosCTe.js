async function getAnexosCTe(pool, id, tipoDocAnexo) {
  const result = {
    obs_contr: [],
    obs_fisco: [],
    comp_calc: [],
    docs: [],
  };

  // Pega as Observações do Fisco se houver
  let sql = `SELECT cte_ocf_titulo AS xCampo, cte_ocf_texto AS xTexto, cte_ocf_interessado AS interessado FROM ctes_obs_contr_fisco WHERE cte_id = ${id} ORDER BY cte_ocf_interessado, cte_ocf_id`;

  const connection = await pool.getConnection();

  // console.log('Pegando as Observações do Fisco se houver...');
  // console.log('sql:', sql);
  const [observacoes] = await connection.query(sql);

  for (const obs of observacoes) {
    let { xCampo, xTexto } = obs;
    let newObs = { xCampo: xCampo.slice(0, 20),  xTexto}

    if (obs.interessado === 'CONTRIBUINTE') {
      result.obs_contr.push(newObs);
    } else {
      result.obs_fisco.push(newObs);
    }
  }

  // Método antigo
  // for (let i = 0; i < obsFisco.length; i++) {
  //     let obs = obsFisco[i];
  //     result.obs_fisco.push(obs);
  // }

  // Pega os Componentes do Calculo
  sql = `
    SELECT
      ccc_titulo AS xNome,
      ccc_valor AS vComp,
      ccc_tipo_tarifa AS CL,
      ccc_valor_tarifa_kg AS vTar
    FROM ctes_comp_calculo
    WHERE cte_id = ${id} AND (ccc_exibir_valor_dacte = 1 OR ccc_valor > 0)
  `;

  // console.log('Pegando os Componentes do Calculo...');
  // console.log('sql:', sql);
  const [calcs] = await connection.query(sql);

  for (const calc of calcs) {
    result.comp_calc.push(calc);
  }

  // for (let i = 0; i < calcs.length; i++) {
  //     let calc = calcs[i];
  //     result.comp_calc.push(calc);
  // }

  // Pega os Documentos nfe, nota antiga ou declarações anexos ao cte
  sql = 'SELECT ';

  let where = `WHERE cte_id = ${id} `;

  switch (tipoDocAnexo) {
    case 1:
      // Nota Fiscal (antiga)
      sql += 'cte_doc_modelo AS modelo, ';
      sql += 'cte_doc_serie AS serie, ';
      sql += 'cte_doc_bc_icms AS vBC, ';
      sql += 'cte_doc_valor_icms AS vICMS, ';
      sql += 'cte_doc_bc_icms_st AS vBCST, ';
      sql += 'cte_doc_valor_icms_st AS vST, ';
      sql += 'cte_doc_valor_produtos AS vProd, ';
      sql += 'cte_doc_valor_nota AS vNF, ';
      sql += 'cte_doc_cfop AS nCFOP, ';
      sql += 'cte_doc_peso_total AS nPeso, ';

      where += 'AND cte_doc_numero IS NOT NULL AND cte_doc_numero != "" ';
      where += 'AND cte_doc_serie IS NOT NULL';

      break;
    case 2:
      // NFe
      sql += 'cte_doc_chave_nfe AS chave, ';

      where += 'AND cte_doc_chave_nfe IS NOT NULL AND cte_doc_chave_nfe != ""';

      break;
    case 3:
      // Declaração
      sql += 'cte_doc_tipo_doc AS tpDoc, ';
      sql += 'cte_doc_descricao AS descOutros, ';
      sql += 'cte_doc_valor_nota AS vDocFisc, ';

      where += 'AND cte_doc_tipo_doc IS NOT NULL';

      break;
  }

  sql += 'cte_doc_numero AS nDoc, ';
  sql += 'cte_doc_pin AS PIN, ';
  sql += 'cte_doc_data_emissao AS dEmi ';
  sql += 'FROM ctes_documentos ';
  sql = sql + where;

  // console.log(' ');
  // console.log(' ');
  // console.log('ctes_documentos: Pegando documentos nfe, nota antiga ou declarações anexos ao cte...');
  // console.log('sql:', sql);
  // console.log(' ');
  // console.log(' ');

  const [rows] = await connection.query(sql);

  for (const doc of rows) {
    result.docs.push(doc);
  }

  connection.release();
  return result;
}

module.exports = getAnexosCTe;
