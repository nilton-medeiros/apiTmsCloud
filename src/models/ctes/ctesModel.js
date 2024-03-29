// require('dotenv').config();

const obterCTe = async (connection, referencia_uid) => {
    let sql = 'SELECT ';
    let results, error;

    sql += 'cte_id,';
    sql += 'emp_id,';
    sql += 'clie_tomador_id AS tom_id,';
    sql += 'clie_remetente_id AS rem_id,';
    sql += 'clie_destinatario_id AS des_id,';
    sql += 'clie_expedidor_id AS exp_id,';
    sql += 'clie_recebedor_id AS rec_id,';
    sql += 'referencia_uuid AS referencia_uid,';
    sql += 'nuvemfiscal_uuid AS nuvemfiscal_uid,';
    sql += 'cte_situacao AS situacao ';
    sql += 'FROM `ctes` ';
    sql += 'WHERE `referencia_uuid` = ? ';

    try {

        [results] = await connection.execute(sql, [referencia_uid]);

        if (Array.isArray(results) && results.length > 0) {
            results = results[0];
        }else{
            error = {status: '404 - Not Found', message: `CTe não encontrado. referencia_uid: ${referencia_uid}`};
        }

    } catch (err) {
        console.log('ERRO SQL:', sql);
        error = {status: 'error', message: 'Internal Server Error'};
        console.log('getModels:28 - Erro ao executar query no banco de dados', err);
    }

    // Se fechar esta conexão, na próxima conexão não reabre, da erro de conexão fechada até que se desligue o servidor app/server.
    // await connection.end(); // Sucesso! Fecha a conexão e retorna o objeto cte

    if (error) {
        return error;
    }

    return results;

};

module.exports = {
    obterCTe,
};
