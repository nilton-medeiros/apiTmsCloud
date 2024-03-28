const outraFuncao = require('../apiNuvemFiscal/outraFuncao');

const obterCTe = async (request, response) => {
    const { referencia_uid } = request.params;
    const cia = referencia_uid.slice(0, 2);

    const ctesModel = require('../models/ctes/ctesModel');
    let fileConnection;

    if (cia === 'ap') {
        fileConnection = '../connectionAP';
    }else{
        fileConnection = '../connectionLW';
    }

    const cte = await ctesModel.obterCTe(referencia_uid, fileConnection);

    if (cte.cte_id) {
        response.status(200).json({status: 'OK', message: 'CTe em processo, webhook retornará respostas direto na tabela `ctes_eventos`.'});
        outraFuncao(cte);
    }else{
        return response.status(cte.status === 'error' ? 500 : 404).json(cte);
    }
};

module.exports = {
    obterCTe,
};