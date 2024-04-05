const ctesModel = require('../models/ctes/ctesModel');
const getDocAnterioresCTe = require('../models/ctes/getDocAnterioresCTe');
const getAnexosCTe = require('../models/ctes/getAnexosCTe');
const getModal = require('../models/ctes/getModal');
const cteSubmit = require('./cteSubmit');

const obterCTe = async (request, response) => {
    const { referencia_uid } = request.params;
    const cia = referencia_uid.slice(0, 2);
    let fileConnection = '../connections/connectionAP.js';

    if (cia === 'lw') {
        fileConnection = '../connections/connectionLW.js';
    }

    const connection = require(fileConnection);
    const cte = await ctesModel.obterCTe(connection, referencia_uid);

    const anexarAoCTe = {
        id: 0,
        anexos: {},
        docAnt: {},
        connection: connection
    };

    if (cte.id) {

        // Libera o cliente da solicitação e segue processamento que fará o Webhook no db do cliente no final
        response.status(200).json({status: 'OK', message: `CTe id: ${cte.id} em processo. Cia: ${cia.toUpperCase()}. As respostas serão retornadas pelo Webhook na tabela ctes_eventos.`});

        anexarAoCTe.id = cte.id;

        // Adiciona os anexos do CTe se houver
        const anexos = await getAnexosCTe(connection, cte.id, cte.tipo_doc_anexo);
        anexarAoCTe.anexos = anexos;

        // Adiciona Documentos dos Emitentes de Documentos anteriores
        const emiDocAnt = await getDocAnterioresCTe(connection, cte.id);
        anexarAoCTe.docAnt.emiDocAnt = emiDocAnt;

        // Adiciona a modalidade Rodoviário ou Aéreo
        const modal = await getModal(connection, cte.id, cte.modal);

        // Cria objeto rodo ou aereo com o modal retornado conforme o tipo do Modal
        if (cte.modal === 1) {
            anexarAoCTe.rodo = modal;
        } else {
            anexarAoCTe.aereo = modal;
        }

        

    }else{
        return response.status(cte.status === 'error' ? 500 : 404).json(cte);
    }

    cteSubmit(anexarAoCTe);

};

/*
    No Controller, a exportação exige um callback function
    e não um objeto diretamente (module.exprots = obterCTe;) <- Isto da erro!
*/
module.exports = {
    obterCTe,
};