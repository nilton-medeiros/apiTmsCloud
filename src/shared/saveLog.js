const fs = require('fs');
const path = require('path'); // Importe o módulo path

// Função temporária, substituir pela biblioteca Winston
// https://github.com/winstonjs/winston

function saveLog(info) {
  // Array com os nomes dos meses
  const nomesDosMeses = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ];

  const curDate = new Date();
  const ano = curDate.getFullYear();
  const mes = String(curDate.getMonth() + 1).padStart(2, '0');
  const dataFormatada = `${ano}${mes}`;

  // Cria o caminho completo para o arquivo de log na pasta "logs/"
  const logFile = 'log' + dataFormatada + '.json';
  const direLog = path.join(__dirname, '../../logs/');

  const logFilePath = direLog + logFile;
  let logEntry = {};

  // Lê o arquivo de log (se existir)

  try {
    const logData = fs.readFileSync(logFilePath, 'utf8');
    logEntry = JSON.parse(logData);
  } catch {
    // Se o arquivo não existir, cria o cabeçalho e um array vazio

    const indiceMesAtual = curDate.getMonth();
    const mesDescritivo = nomesDosMeses[indiceMesAtual];

    logEntry.title = `Log de Sistema ApiTmsCloud 1.0 - ${mesDescritivo.toUpperCase()} DE ${ano}`;
    logEntry.logger = [];
  }

  // Adiciona a nova entrada ao array logger no objeto logEntry

  logEntry.logger.push({
    timestamp: new Date().toLocaleString('pt-BR'),
    level: info.level,
    message: info.message,
    meta: info.meta || undefined,
  });

  // Converte o objeto logEntry em JSON para arquivo de logging
  fs.writeFileSync(logFilePath, JSON.stringify(logEntry, null, 2));
}

module.exports = saveLog;
