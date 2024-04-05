const express = require('express');
const router = express.Router();

const ctesMiddleware = require('./middlewares/ctesMiddleware');
const ctesController = require('./controllers/ctesController');

router.post('/cte/:referencia_uid', ctesMiddleware.validateFields, ctesController.obterCTe);

module.exports = router;