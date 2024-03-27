const emitirCTe = async (request, response) => {
    const { referencia_uid } = request.params;
    const cia = referencia_uid.slice(0, 2);

    const ctesModel = require('../models/ctesModel');
    let fileConnection;

    if (cia === 'ap') {
        fileConnection = './connectionAP';
    }else{
        fileConnection = './connectionLW';
    }

    const cte = await ctesModel.emitirCTe(referencia_uid, fileConnection);

    if (cte.cte_id) {
        return response.status(200).json({status: 'OK', message: 'CTe em processo de emissão'});
    }else{
        return response.status(cte.status === 'error' ? 500 : 404).json(cte);
    }
};

module.exports = {
    emitirCTe,
};