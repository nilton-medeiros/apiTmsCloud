const express = require('express');
const router = express.Router();

const ctesMiddleware = require('./middlewares/ctesMiddleware');
const authMiddleware = require('./middlewares/authMiddleware');
const ctesController = require('./controllers/ctesController');

router.post(
    '/cte/:referencia_uid',
    authMiddleware.verifyApiToken,
    authMiddleware.getAuthNuvemfiscal,
    ctesMiddleware.validateFields,
    ctesController.obterCTe,
);

module.exports = router;