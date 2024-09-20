const validateFields = async (request, response, next) => {
  const { referencia_uid } = request.params;

  if (referencia_uid === undefined) {
    // status 400 - invalid request
    return response.status(400).json({ msg: 'Campo referencia_uuid é requerido' });
  }
  if (!(typeof referencia_uid === 'string') || referencia_uid === '') {
    return response.status(400).json({ msg: 'Campo referencia_uuid inválido' });
  }

  // console.log('Passou pelo validateFields', 'indo para o próximo middle next()');
  next();
};

module.exports = {
  validateFields,
};
