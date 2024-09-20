/*
 * ----------------------------------------------------------------
 * Funções para manipulação de datas e horas
 * ----------------------------------------------------------------
*/


// FORMATO UTC AO ENVIAR PARA NUVEMFISCAL NO FORMATO "2024-09-16T23:19:00Z" (o Z indica UTC zero)
function dateISOFormatUTC(dateObject) {

  if (!isValidDate(dateObject)) {
    dateObject = new Date;
  }

  return dateObject.toISOString().slice(0, 19) + "Z"
}


// "YYYY-MM-DD"
function dateISO(dateObject) {

  if (!isValidDate(dateObject)) {
    dateObject = new Date;
  }

  return dateObject.toISOString().slice(0, 10)
}


// Verifica se o parametro passado ou não é um objeto date válido
function isValidDate(date) {
  return date instanceof Date && !isNaN(date);
}

// Converte um objeto date para hora local 'pt-BR' e retorna uma string formatada
// return "yyyy-MM-ddTHH:mm:ss". Formato para Sefaz.

/*
 * Para usar esse módulo, importe-o no seu código com:
 * const dateFormatPtBR = require('./dateTools');
 *
 * E então utilize-o da seguinte forma:
 * const dataAtualFormatada = dateFormatPtBR(new Date());
 * console.log(dataAtualFormatada); // Saída: "yyyy-MM-ddTHH:mm:ss"
*/
function dateFormatPtBR(dateObject) {
  // Recebendo por parâmetro um objeto Date com a data e hora atual timestamp
  // Obtendo a data formatada (YYYY-MM-DD)

  if (!isValidDate(dateObject)) {
    dateObject = new Date;
  }

  const dataFormatada = dateObject
    .toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .split('/')
    .reverse()
    .join('-');

  // Obtendo a hora formatada (HH:MM:SS)
  const horaFormatada = dateObject.toLocaleTimeString('pt-BR', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Combinando a data e a hora no formato desejado
  return `${dataFormatada}T${horaFormatada}`;
}

module.exports = {
  dateISOFormatUTC,
  dateISO,
  isValidDate,
  dateFormatPtBR,
};