async function getModal(connection, cteId, modal) {

    if (modal === 1) {
        return await getRodoModal(connection, cteId);
    }

    return await getAereoModal(connection, cteId);
}


async function getRodoModal(connection, cteId) {
    const occ = [];

    let sql = 'SELECT ';
    sql += 'oca_serie AS serie, ';
    sql += 'oca_numero AS nOcc, ';
    sql += 'oca_data_emissao AS dEmi, ';
    sql += 'oca_cnpj_emitente AS CNPJ, ';
    sql += 'oca_inscricao_estadual AS IE, ';
    sql += 'oca_uf_ie AS UF ';
    sql += 'FROM ctes_rod_coletas ';
    sql += 'WHERE cte_id = ? ';
    sql += 'ORDER BY oca_data_emissao';

    const [coletas] = await connection.execute(sql, [cteId]);

    if(Array.isArray(coletas) && coletas.length > 0) {
        for (const coleta of coletas) {
            occ.push({
                serie: coleta.serie || '',
                nOcc: coleta.nOcc,
                dEmi: coleta.dEmi,
                CNPJ: coleta.CNPJ,
                IE: coleta.IE,
                UF: coleta.UF
            });
        }
    }

    return occ;
}

async function getAereoModal(connection, cteId) {
    const cubagem = {};

    let sql = 'SELECT ';
    sql += 'FORMAT(cte_dim_cumprimento * 100, 0) AS cumprimento, ';
    sql += 'FORMAT(cte_dim_altura * 100, 0) AS altura, ';
    sql += 'FORMAT(cte_dim_largura * 100, 0) AS largura, ';
    sql += 'cte_dim_cubagem_m3 ';
    sql += 'FROM ctes_dimensoes ';
    sql += 'WHERE cte_id = ? ';
    sql += 'ORDER BY cte_dim_cubagem_m3 DESC LIMIT 1';

    const [dim] = await connection.execute(sql, [cteId]);

    if(Array.isArray(dim) && dim.length === 1) {
        const cump = dim[0].cumprimento.padStart(4, '0');
        const altu = dim[0].altura.padStart(4, '0');
        const larg = dim[0].largura.padStart(4, '0');
        cubagem.xDime = cump + 'X' + altu + 'X' + larg;
        cubagem.cInfManu = ['99'];
    }

    return cubagem;
}


module.exports = getModal;
