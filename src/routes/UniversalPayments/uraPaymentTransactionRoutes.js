const express = require('express');
const {
  SystemPRNTrackerController,
} = require('@controllers/UniversalPayments');
const loginRequired = require('../../app/middleware/authRoute');

const systemPRNTrackerRouter = express.Router();

const controller = new SystemPRNTrackerController();

systemPRNTrackerRouter.post('/', controller.acknowledgePaymentsByURA);

systemPRNTrackerRouter.post(
  '/manual-override',
  [loginRequired],
  controller.manuallyOverrideStudentTransaction
);

systemPRNTrackerRouter.post(
  '/confirm-manual-override',
  [loginRequired],
  controller.confirmManualOverrideStudentTransaction
);

systemPRNTrackerRouter.post(
  '/manually-balance-invoice-elements',
  [loginRequired],
  controller.manuallyBalanceStudentInvoiceElements
);

systemPRNTrackerRouter.post(
  '/manually-balance-invoices',
  [loginRequired],
  controller.manuallyBalanceInvoicesFromStudentTransactions
);

module.exports = systemPRNTrackerRouter;
