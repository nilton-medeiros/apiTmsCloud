require('dotenv').config();
const getAnexosCTe = require('./getAnexosCTe');

const obterCTe = async (referencia_uid, fileConnection) => {
    let query = 'SELECT ';
    query += 'cte_id,';
    query += 'emp_id,';
    query += 'referencia_uuid AS referencia_uid,';
    query += 'clie_tomador_id AS tom_id,';
    query += 'tom_icms AS indIEToma,';
    query += 'tom_ie_isento,';
    query += 'cte_tomador AS tomador,';
    query += 'tom_cnpj,';
    query += 'tom_ie,';
    query += 'tom_cpf,';
    query += 'tom_nome_fantasia AS tom_xFant,';
    query += 'tom_razao_social AS tom_xNome,';
    query += 'tom_fone,';
    query += 'tom_end_logradouro,';
    query += 'tom_end_numero,';
    query += 'tom_end_complemento,';
    query += 'tom_end_bairro,';
    query += 'tom_cid_codigo_municipio,';
    query += 'tom_cid_municipio,';
    query += 'tom_end_cep,';
    query += 'tom_cid_uf,';
    query += 'cte_carac_adic_transp AS xCaracAd,';
    query += 'cte_carac_adic_servico AS xCaracSer,';
    query += 'cte_emissor AS xEmi,';
    query += 'cid_origem_sigla AS xOrig,';
    query += 'cid_passagem_sigla AS xPass,';
    query += 'cid_destino_sigla AS xDest,';
    query += 'cte_tp_data_entrega AS tpPer,';
    query += 'cte_data_programada AS dProg,';
    query += 'cte_data_inicial AS dIni,';
    query += 'cte_data_final AS dFim,';
    query += 'cte_tp_hora_entrega AS tpHor,';
    query += 'cte_hora_programada AS hProg,';
    query += 'cte_hora_inicial AS hIni,';
    query += 'cte_hora_final AS hFim,';
    query += 'cte_obs_gerais AS xObs,';
    query += 'clie_remetente_id AS rem_id,';
    query += 'rem_razao_social AS rem_xNome,';
    query += 'rem_nome_fantasia AS rem_xFant,';
    query += 'rem_cnpj,';
    query += 'rem_ie,';
    query += 'rem_cpf,';
    query += 'rem_fone,';
    query += 'rem_end_logradouro,';
    query += 'rem_end_numero,';
    query += 'rem_end_complemento,';
    query += 'rem_end_bairro,';
    query += 'rem_cid_codigo_municipio,';
    query += 'rem_cid_municipio,';
    query += 'rem_end_cep,';
    query += 'rem_cid_uf,';
    query += 'clie_destinatario_id AS des_id,';
    query += 'des_razao_social AS des_xNome,';
    query += 'des_nome_fantasia AS des_xFant,';
    query += 'des_cnpj,';
    query += 'des_ie,';
    query += 'des_cpf,';
    query += 'des_fone,';
    query += 'des_end_logradouro,';
    query += 'des_end_numero,';
    query += 'des_end_complemento,';
    query += 'des_end_bairro,';
    query += 'des_cid_codigo_municipio,';
    query += 'des_cid_municipio,';
    query += 'des_end_cep,';
    query += 'des_cid_uf,';
    query += 'des_icms,';
    query += 'des_inscricao_suframa,';
    query += 'clie_expedidor_id AS exp_id,';
    query += 'exp_razao_social AS exp_xNome,';
    query += 'exp_nome_fantasia AS exp_xFant,';
    query += 'exp_cnpj,';
    query += 'exp_ie,';
    query += 'exp_cpf,';
    query += 'exp_fone,';
    query += 'exp_end_logradouro,';
    query += 'exp_end_numero,';
    query += 'exp_end_complemento,';
    query += 'exp_end_bairro,';
    query += 'exp_cid_codigo_municipio,';
    query += 'exp_cid_municipio,';
    query += 'exp_end_cep,';
    query += 'exp_cid_uf,';
    query += 'clie_recebedor_id AS rec_id,';
    query += 'rec_razao_social AS rec_xNome,';
    query += 'rec_nome_fantasia AS rec_xFant,';
    query += 'rec_cnpj,';
    query += 'rec_ie,';
    query += 'rec_cpf,';
    query += 'rec_fone,';
    query += 'rec_end_logradouro,';
    query += 'rec_end_numero,';
    query += 'rec_end_complemento,';
    query += 'rec_end_bairro,';
    query += 'rec_cid_codigo_municipio,';
    query += 'rec_cid_municipio,';
    query += 'rec_end_cep,';
    query += 'rec_cid_uf,';
    query += 'cte_versao_leiaute_xml AS versao_xml,';
    query += 'cte_data_hora_emissao AS dhEmi,';
    query += 'cte_modelo AS modelo,';
    query += 'cte_serie AS serie,';
    query += 'cte_numero AS nCT,';
    query += 'cte_minuta AS cCT,';
    query += 'cte_situacao AS situacao,';
    query += 'cte_chave AS chCTe,';
    query += 'cte_protocolo_autorizacao AS nProt,';
    query += 'cte_cfop AS CFOP,';
    query += 'cte_natureza_operacao AS natOp,';
    query += 'cte_forma_emissao AS tpEmis,';
    query += 'cte_tipo_do_cte AS tpCTe,';
    query += 'cte_modal AS modal,';
    query += 'cte_tipo_servico AS tpServ,';
    query += 'cid_origem_codigo_municipio AS cMunIni,';
    query += 'cid_origem_municipio AS xMunIni,';
    query += 'cid_origem_uf AS UFIni,';
    query += 'cid_destino_codigo_municipio AS cMunFim,';
    query += 'cid_destino_municipio AS xMunFim,';
    query += 'cid_destino_uf AS UFFim,';
    query += 'cte_retira AS retira,';
    query += 'cte_detalhe_retira AS xDetRetira,';
    query += 'cte_valor_total AS vTPrest,';
    query += 'cte_valor_bc AS vBC,';
    query += 'cte_aliquota_icms AS pICMS,';
    query += 'cte_valor_icms AS vICMS,';
    query += 'cte_valor_pis AS vPIS,';
    query += 'cte_valor_cofins AS vCofins,';
    query += 'cte_perc_reduc_bc AS pRedBC,';
    query += 'cte_valor_cred_outorgado AS vCred,';
    query += 'cte_codigo_sit_tributaria AS codigo_sit_tributaria,';
    query += 'cte_info_fisco AS infAdFisco,';
    query += 'cte_valor_carga AS vCarga,';
    query += 'produto_predominante_nome AS proPred,';
    query += 'gt_id_codigo AS cTar,';
    query += 'cte_outras_carac_carga AS xOutCat,';
    query += 'cte_peso_bruto AS peso_bruto,';
    query += 'cte_peso_cubado AS peso_cubado,';
    query += 'cte_peso_bc AS peso_bc,';
    query += 'cte_cubagem_m3 AS cubagem_m3,';
    query += 'cte_qtde_volumes AS qtde_volumes,';
    query += 'cte_tipo_doc_anexo AS tipo_doc_anexo,';
    query += 'cte_operacional_master AS nOCA,';
    query += 'cte_data_entrega_prevista AS dPrevAereo ';
    query += 'FROM `view_ctes` ';
    query += 'WHERE `referencia_uuid` = ? ORDER BY `referencia_uuid` DESC';

    const connection = require(fileConnection);
    let results, error;

    try {

        [results] = await connection.execute(query, [referencia_uid]);

        if (Array.isArray(results) && results.length > 0) {
            results = results[0];
            const cte_id = results.cte_id;
            const tipoDocAnexo = results.tipo_doc_anexo;
            const anexos = await getAnexosCTe(connection, cte_id, tipoDocAnexo);
            results.anexos = anexos;
        }else{
            error = {status: '404 - Not Found', message: `CTe não encontrado. referencia_uid: ${referencia_uid}`};
        }

    } catch (err) {
        error = {status: 'error', message: 'Internal Server Error'};
        console.log(`Erro ao executar query ao banco de dados ${fileConnection}`, err);
    }

    // Se fechar esta conexão, na próxima conexão não reabre, não executa, da erro de conexão fechada até que se desligue o servidor app/server.
    // await connection.end(); // Sucesso! Fecha a conexão e retorna o objeto cte

    if (error) {
        return error;
    }

    return results;

};

module.exports = {
    obterCTe,
};
