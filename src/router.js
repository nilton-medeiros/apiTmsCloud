const express = require('express');
const router = express.Router();

const authMiddleware = require('./middlewares/authMiddleware');
const ctesMiddleware = require('./middlewares/ctesMiddleware');
const ctesController = require('./controllers/ctesController');

// router.use(authMiddleware)

router.post(
  '/cte/:referencia_uid',
  authMiddleware.verifyApiToken,
  authMiddleware.getAuthNuvemfiscal,
  ctesMiddleware.validateFields,
  ctesController.obterCTe,
);

module.exports = router;
