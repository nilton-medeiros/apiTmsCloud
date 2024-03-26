const express = require('express');

const router = express.Router();

const ctesMiddleware = require('./middlewares/ctesMiddleware');
const ctesController = require('./controllers/ctesController');

// Exemplo: http://localhost:3333/cte/lwc_dc452264e55d11eeb3c79457a55bde60
router.post('/cte/:referencia_uid', ctesMiddleware.validateFields, ctesController.emitirCTe);

module.exports = router;