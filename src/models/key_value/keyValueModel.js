const saveLog = require('../../utils/saveLog');

const obterToken = async (connection, uId) => {
    const sql = 'SELECT value AS token, expires_in FROM key_value WHERE id = ?';
    let results;

    try {

        [results] = await connection.execute(sql, [uId]);
        console.log(results);

        if (results.length > 0) {
            results = results[0];
        }else{
            console.log('Gerar um novo token e salvar na tabela');
        }

    } catch (err) {
        console.log('ERRO SQL:', sql);
        saveLog('keyValueModel: - Erro ao executar query no banco de dados' + err);
    }

    // Se fechar esta conexão, na próxima conexão não reabre, da erro de conexão fechada até que se desligue o servidor app/server.
    // await connection.end(); // Sucesso! Fecha a conexão e retorna o objeto cte

    return results;

};

module.exports = {
    obterToken,
};
