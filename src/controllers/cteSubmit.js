const saveLog = require('../utils/saveLog');

async function cteSubmit(cteAnexos) {
    const id = cteAnexos.id;
    const connection = cteAnexos.connection;

    let results, error;
    let sql = 'SELECT * FROM view_ctes_sefaz WHERE cte_id = ?';

    try {

        [results] = await connection.execute(sql, [id]);

        if (results.length > 0) {
            results = results[0];
            saveLog(results);
        }else{
            const msg = `CTe não encontrado. id: ${id}`;
            error = {status: '404 - Not Found', message: msg};
            saveLog(msg);
        }

    } catch (err) {
        console.log('ERRO SQL:', sql);
        error = {status: 'error', message: 'Internal Server Error'};
        saveLog('getModels:26 - Erro ao executar query no banco de dados' + err);
    }

    if (error) {
        return error;
    }

    const apiCTe = new ApiCTe(cte);

    return results;

}

module.exports = cteSubmit;