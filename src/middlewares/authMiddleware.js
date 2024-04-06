const {obterToken} = require('../models/key_value/obterToken');

require('dotenv').config();

const verifyApiToken = (request, response, next) => {
    const headersAuth = request.headers.authorization;

    if (!headersAuth) {
        return response.status(400).json({
            status: 'error',
            message: 'Bad Request: Authorization Bearer token não enviado no headers'
        });
    }

    const token = headersAuth.split(' ')[1];

    if (!token) {
        return response.status(400).json({
            status: 'error',
            message: 'Bad Request: Cade o Token?'
        });
    }

    if (!(token === process.env.ACCESS_TOKEN)) {
        return response.status(401).json({
            status: 'error',
            message: 'Unauthorized - API Token inválido'
        });
    }

    next();
};

const getAuthNuvemfiscal = async (request, response, next) => {
    const auth = await obterToken();

    if (!(auth.authorized)) {
        return response.status(auth.status).json({
            satus: 'error',
            message: auth.error,
        });
    }

    request.authToken = auth.token;

    next();
};

module.exports = {
    getAuthNuvemfiscal,
    verifyApiToken,
};
