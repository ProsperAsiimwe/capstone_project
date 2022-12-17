const express = require('express');
const { ReceivableController } = require('@controllers/UniversalPayments');
const { chartOfAccountValidator } = require('@validators/UniversalPayments');

const chartOfAccountRouter = express.Router();
const controller = new ReceivableController();

chartOfAccountRouter.get('/', controller.index);

chartOfAccountRouter.post(
  '/',
  [chartOfAccountValidator.validateCreateAccountReceivable],
  controller.createReceivable
);

chartOfAccountRouter.put(
  '/:id',
  [chartOfAccountValidator.validateCreateAccountReceivable],
  controller.updateReceivable
);

chartOfAccountRouter.post(
  '/download-receivables-upload-template',
  controller.downloadReceivablesTemplate
);
chartOfAccountRouter.post(
  '/upload-receivables',
  controller.uploadReceivablesTemplate
);

chartOfAccountRouter.delete('/:id', controller.deleteReceivable);

module.exports = chartOfAccountRouter;
