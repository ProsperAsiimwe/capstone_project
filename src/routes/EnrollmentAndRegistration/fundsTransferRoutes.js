const express = require('express');
const {
  FundsTransferController,
} = require('@controllers/EnrollmentAndRegistration');
const {
  fundsTransferValidator,
} = require('@validators/EnrollmentAndRegistration');

const fundsTransferRouter = express.Router();
const controller = new FundsTransferController();

// Events Management Routes.
fundsTransferRouter.get('/', controller.index);

fundsTransferRouter.post(
  '/',
  [fundsTransferValidator.validateFundsTransfer],
  controller.createFundsTransfer
);

fundsTransferRouter.post(
  '/approve',
  [fundsTransferValidator.validateApproveFundsTransfer],
  controller.approveFundsTransfer
);

fundsTransferRouter.get('/:id', controller.fetchFundsTransfer);

fundsTransferRouter.delete('/:id', controller.deleteFundsTransfer);

module.exports = fundsTransferRouter;
