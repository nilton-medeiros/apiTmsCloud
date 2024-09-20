const dbGetCTe = require('../models/ctes/ctesModel');
const getDocAnterioresCTe = require('../models/ctes/getDocAnterioresCTe');
const getAnexosCTe = require('../models/ctes/getAnexosCTe');
const getModal = require('../models/ctes/getModal');
const cteSubmit = require('./cteSubmit');

const obterCTe = async (request, response) => {
  const { referencia_uid } = request.params;

  // Obtem informações relevantes por referência do cte
  const cte = await dbGetCTe(referencia_uid);

  if ('statusError' in cte) {
    return response.status(cte.statusError).json({ msg: cte.msg });
  }

  const anexosCTe = {
    id: 0,
    anexos: {},
    docAnt: {},
    pool: cte.pool,
    authToken: request.authToken,
  };

  // Libera o cliente da solicitação e segue processamento que fará o Webhook no db do cliente no final
  // status 202 - Aceito
  response.status(202).json({ cte_id: cte.id, referencia: referencia_uid, msg: 'Em processamento... Retorno pelo webhook!' });

  anexosCTe.id = cte.id;

  // Adiciona os anexos do CTe se houver
  const anexos = await getAnexosCTe(cte.pool, cte.id, cte.tipo_doc_anexo);
  anexosCTe.anexos = anexos;

  // Adiciona Documentos dos Emitentes de Documentos anteriores
  const emiDocAnt = await getDocAnterioresCTe(cte.pool, cte.id);

  if (emiDocAnt.length > 0) {
    anexosCTe.docAnt = emiDocAnt;
  }


  // Cria objeto rodo ou aereo com o modal retornado conforme o tipo do Modal
  anexosCTe.modal = getModal(cte.pool, cte.id, cte.tpModal);

  await cteSubmit(anexosCTe);
};

/*
    No Controller, a exportação exige um callback function
    e não um objeto diretamente "module.exprots = obterCTe;" <- Isto da erro!
*/

module.exports = {
  obterCTe,
};
