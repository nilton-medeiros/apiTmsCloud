const { obterToken } = require('../models/key_value/obterToken');

require('dotenv').config();

const verifyApiToken = async (request, response, next) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    // status: 401 - Invalid credentials
    return response.status(401).json({ msg: 'No token provider' });
  }

  const parts = authHeader.split(' ');

  if (!parts.length === 2) {
    return response.status(401).json({ msg: 'Token error!' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return response.status(401).send({ msg: 'Token malFormatted' });
  }

  /*
    Substituir posteriormente pelo jwt:
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) return response.status(401).send({
            status: 'error',
            message: 'Token invalid'
        });

        Sinaliza para outro middlewares que este usuário já está logado
        request.userId = decoded.id;
    });
     */

  if (!(token === process.env.ACCESS_TOKEN)) {
    return response.status(401).json({ msg: 'Token invalid' });
  }

  next();
};

const getAuthNuvemfiscal = async (request, response, next) => {
  const auth = await obterToken();

  if (!auth.authorized) {
    return response.status(auth.status).json({ msg: auth.error });
  }

  request.authToken = auth.token;

  next();
};

module.exports = {
  getAuthNuvemfiscal,
  verifyApiToken,
};
