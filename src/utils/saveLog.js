const fs = require('fs');
const path = require('path'); // Importe o módulo path

function saveLog(info) {
    const logEntry = {
        timestamp: new Date().toLocaleString(),
        operation: info
    };

    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dataFormatada = `${ano}${mes}`;

    // Crie o caminho completo para o arquivo de log na pasta "logs/"
    const logFile = 'log' + dataFormatada + '.json';
    const direLog =  path.join(__dirname, '../../logs/');

    const logFilePath = direLog + logFile;

    console.log(logFilePath);

    // Lê o arquivo de log (se existir)
    let logs = [];
    try {
        const logData = fs.readFileSync(logFilePath, 'utf8');
        logs = JSON.parse(logData);
    } catch (error) {
        // Se o arquivo não existir, cria um array vazio
    }

    // Adiciona a nova entrada ao array de logs
    logs.push(logEntry);

    // Escreve o array atualizado de logs no arquivo
    fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));

}

module.exports = saveLog;