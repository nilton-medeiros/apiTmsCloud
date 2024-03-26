async function getAnexosCTe(connection, id, tipoDocAnexo) {
    const result = {
        obs_fisco: [],
        comp_calc: [],
        docs: []
    };

    // Pega as Observações do Fisco se houver
    let query = 'SELECT cte_ocf_titulo AS xCampo, cte_ocf_texto AS xTexto, cte_ocf_interessado AS interessado ';

    query += 'FROM ctes_obs_contr_fisco ';
    query += 'WHERE cte_id = ? ';
    query += 'ORDER BY cte_ocf_interessado, cte_ocf_id';

    const [obsFisco] = await connection.execute(query, [id]);

    for (let i = 0; i < obsFisco.length; i++) {
        let obs = obsFisco[i];
        result.obs_fisco.push(obs);
    }

    // Pega os Componentes do Calculo
    query = 'SELECT ccc_titulo AS xNome, ';
    query += 'ccc_valor AS vComp, ';
    query += 'ccc_tipo_tarifa AS CL, ';
    query += 'ccc_valor_tarifa_kg AS vTar ';
    query += 'FROM ctes_comp_calculo ';
    query += 'WHERE cte_id = ? ';
    query += 'AND (ccc_exibir_valor_dacte = 1 OR ccc_valor > 0)';

    const [calcs] = await connection.execute(query, [id]);

    for (let i = 0; i < calcs.length; i++) {
        let calc = calcs[i];
        result.comp_calc.push(calc);
    }

    // Pega os Documentos nfe, nota antiga ou declarações anexos ao cte
    query = 'SELECT ';

    let where = 'WHERE cte_id = ? ';

    switch (tipoDocAnexo) {
    case 1:
        // Nota Fiscal (antiga)
        query += 'cte_doc_modelo AS modelo, ';
        query += 'cte_doc_serie AS serie, ';
        query += 'cte_doc_bc_icms AS vBC, ';
        query += 'cte_doc_valor_icms AS vICMS, ';
        query += 'cte_doc_bc_icms_st AS vBCST, ';
        query += 'cte_doc_valor_icms_st AS vST, ';
        query += 'cte_doc_valor_produtos AS vProd, ';
        query += 'cte_doc_valor_nota AS vNF, ';
        query += 'cte_doc_cfop AS nCFOP, ';
        query += 'cte_doc_peso_total AS nPeso, ';
        where += 'AND cte_doc_numero IS NOT NULL AND cte_doc_numero != "" ';
        where += 'AND cte_doc_serie IS NOT NULL';
        break;
    case 2:
        // NFe
        query += 'cte_doc_chave_nfe AS chave, ';
        where += 'AND cte_doc_chave_nfe IS NOT NULL AND cte_doc_chave_nfe != ""';
        break;
    case 3:
        // Declaração
        query += 'cte_doc_tipo_doc AS tpDoc, ';
        query += 'cte_doc_descricao AS descOutros, ';
        query += 'cte_doc_valor_nota AS vDocFisc, ';
        where += 'AND cte_doc_tipo_doc IS NOT NULL';
        break;
    }

    query += 'cte_doc_numero AS nDoc, ';
    query += 'cte_doc_pin AS PIN, ';
    query += 'cte_doc_data_emissao AS dEmi ';
    query += 'FROM ctes_documentos ';
    query += where;

    const [docs] = await connection.execute(query, [id]);

    for (let i = 0; i < docs.length; i++) {
        let doc = docs[i];
        result.docs.push(doc);
    }

    return result;
}

module.exports = getAnexosCTe;
