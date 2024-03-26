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
    console.log(cte);

    if (cte.status && cte.status === 'error') {
        return response.status(500).json(cte.errorCTe);
    } else {
        return response.status(200).json(cte);
    }
};

module.exports = {
    emitirCTe,
};