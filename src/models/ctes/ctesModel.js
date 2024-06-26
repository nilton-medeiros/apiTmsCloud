const saveLog = require('../../utils/saveLog');

const obterCTe = async (connection, referencia_uid) => {
    let sql = 'SELECT ';
    let results, error;

    sql += 'cte_id AS id, ';
    sql += 'cte_tipo_doc_anexo AS tipo_doc_anexo, ';
    sql += 'cte_modal AS modal, ';
    sql += 'FROM ctes ';
    sql += `WHERE referencia_uuid = '${referencia_uid}'`;
    console.log(sql);

    try {

        [results] = await connection.execute(sql);
        saveLog(results);

        if (results.length > 0) {
            results = results[0];
        }else{
            const msg = `CTe não encontrado. referencia_uid: ${referencia_uid}`;
            error = {status: '404 - Not Found', message: msg};
            saveLog(msg);
        }

    } catch (err) {
        console.log('ERRO SQL:', sql);
        error = {status: 'error', message: 'Internal Server Error'};
        saveLog('getModels: Erro ao executar query no banco de dados' + err);
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
