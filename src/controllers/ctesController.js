const outraFuncao = require('../apiNuvemFiscal/outraFuncao');
const ctesModel = require('../models/ctes/ctesModel');
const getDocAnterioresCTe = require('../models/ctes/getDocAnterioresCTe');
const getAnexosCTe = require('../models/ctes/getAnexosCTe');
const getEmailsCTe = require('../models/ctes/getEmailsCTe');
const getModal = require('../models/ctes/getModal');

const obterCTe = async (request, response) => {
    const { referencia_uid } = request.params;
    const cia = referencia_uid.slice(0, 2);
    let fileConnection = '../models/connectionAP.js';

    if (cia === 'lw') {
        fileConnection = '../models/connectionLW';
    }

    const connection = require(fileConnection);
    const cte = await ctesModel.obterCTe(connection, referencia_uid);

    if (cte.cte_id) {

        // Libera o cliente da solicitação e segue processamento que fará o Webhook no db do cliente no final
        response.status(200).json({status: 'OK', message: 'CTe em processo, webhook retornará respostas na tabela `ctes_eventos`.'});

        // Adiciona os anexos do CTe se houver
        const anexos = await getAnexosCTe(connection, cte.cte_id, cte.tipo_doc_anexo);
        cte.anexos = anexos;

        // Adiciona os emails dos envolvidos (autores) do CTe
        const autoresId = {
            tomId: cte.tom_id,
            remId: cte.rem_id,
            desId: cte.des_id,
            expId: cte.exp_id,
            recId: cte.rec_id
        };
        const emails = await getEmailsCTe(connection, autoresId);
        cte.emails = emails;

        // Adiciona Documentos dos Emitentes de Documentos anteriores
        const emiDocAnt = await getDocAnterioresCTe(connection, cte.cte_id);
        cte.docAnt = {};
        cte.docAnt.emiDocAnt = emiDocAnt;

        // Adiciona a modalidade Rodoviário ou Aéreo
        const modal = await getModal(connection, cte.cte_id, cte.modal);

        if (cte.modal === 1) {
            cte.rodo = modal;
        } else {
            cte.aereo = modal;
        }

        // Parei aqui, proximo: getRodoOCC() e getAereoCub3()
        outraFuncao(cte);
    }else{
        return response.status(cte.status === 'error' ? 500 : 404).json(cte);
    }

};

/*
    No Controller, a exportação exige um callback function
    e não um objeto diretamente (module.exprots = obterCTe;) <- Isto da erro!
*/
module.exports = {
    obterCTe,
};