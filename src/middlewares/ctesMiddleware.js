const validateFields = (request, response, next) => {
    const { referencia_uid } = request.params;

    if (referencia_uid === undefined) {
        return response.status(400).json({
            satus: 'error',
            message: 'O campo referencia_uuid é requerido'
        });
    }
    if (!(typeof referencia_uid === 'string') || referencia_uid === '') {
        return response.status(400).json({
            satus: 'error',
            message: 'O campo referencia_uuid não pode ser vazio'
        });
    }

    next();
};

module.exports = {
    validateFields,
};
