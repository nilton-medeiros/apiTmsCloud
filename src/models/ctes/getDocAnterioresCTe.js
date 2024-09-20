async function getDocAnterioresCTe(pool, cteId) {
  const result = [];
  let sql = 'SELECT ';

  sql += 'cte_eda_id as eda_id,';
  sql += 'cte_eda_tipo_doc AS tipoDoc,';
  sql += 'cte_eda_cnpj AS CNPJ,';
  sql += 'cte_eda_cpf AS CPF,';
  sql += 'cte_eda_ie AS IE,';
  sql += 'cte_eda_ie_uf AS UF,';
  sql += 'cte_eda_raz_social_nome AS xNome ';
  sql += 'FROM ctes_emitentes_ant ';
  sql += `WHERE cte_id = ${cteId} `;
  sql += 'ORDER BY cte_eda_raz_social_nome';

  const connection = await pool.getConnection();

  // console.log("Obtendo Documentos Anteriores se houver...")
  // console.log(sql)
  const [emitentes] = await connection.query(sql);

  if (emitentes.length > 0) {
    let EmitDocAnt = {};

    for (const emitente of emitentes) {
      if (emitente.tipoDoc === 'CNPJ') {
        EmitDocAnt.CNPJ = emitente.CNPJ;
        EmitDocAnt.IE = emitente.IE;
      } else {
        EmitDocAnt.CPF = emitente.CPF;
      }

      EmitDocAnt.UF = emitente.UF;
      EmitDocAnt.xNome = emitente.xNome;
      EmitDocAnt.idDocAnt = [];

      sql = 'SELECT ';
      sql += 'cte_dta_tpdoc AS tpDoc,';
      sql += 'cte_dta_serie AS serie,';
      sql += 'cte_dta_sub_serie AS subser,';
      sql += 'cte_dta_numero AS nDoc,';
      sql += 'cte_dta_data_emissao AS dEmi,';
      sql += 'cte_dta_chave AS chCTe ';
      sql += 'FROM ctes_doc_transp_ant ';
      sql += `WHERE cte_eda_id = ${emitente.eda_id} `;
      sql += 'ORDER BY cte_dta_chave, cte_dta_serie, cte_dta_sub_serie, cte_dta_numero';

      // console.log("Obtendo Documentos Transportes Anteriores se houver...")
      // console.log(sql)
      
      const [docTransAnts] = await connection.query(sql);

      if (docTransAnts.length > 0) {
        for (const docTranAnt of docTransAnts) {
          if (docTranAnt.chCTe) {
            EmitDocAnt.idDocAnt.push({ chCTe: docTranAnt.chCTe });
          } else if (docTranAnt.tpDoc) {
            EmitDocAnt.idDocAnt.push({
              tpDoc: docTranAnt.tpDoc,
              serie: docTranAnt.serie,
              subser: docTranAnt.subser,
              nDoc: docTranAnt.nDoc,
              dEmi: docTranAnt.dEmi,
            });
          }
        }
      }
      result.push(EmitDocAnt);
    }
  }

  connection.release();
  return result;
}

module.exports = getDocAnterioresCTe;
