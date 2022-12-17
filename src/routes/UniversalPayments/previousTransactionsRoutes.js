// PreviousTransactionsController
const express = require('express');
const {
  PreviousTransactionsController,
} = require('@controllers/UniversalPayments');
const previousTransactionsRouter = express.Router();

const controller = new PreviousTransactionsController();
const { universalInvoiceValidator } = require('@validators/UniversalPayments');

// transactions

previousTransactionsRouter.get('/', controller.studentPreviousDeposits);

previousTransactionsRouter.post(
  '/download-template',
  controller.downloadPreviousTransactionsTemplate
);

previousTransactionsRouter.post(
  '/upload-template',
  controller.uploadPreviousTransactions
);

previousTransactionsRouter.post(
  '/push-to-student-account',
  [universalInvoiceValidator.validatePushToStudentAccount],
  controller.pushSinglePreviousStudentAccount
);

previousTransactionsRouter.delete(
  '/tuition-payments',
  [universalInvoiceValidator.validateDeletePreviousPayments],
  controller.deletePreviousTuition
);

previousTransactionsRouter.delete(
  '/pre-payment-deposits',
  [universalInvoiceValidator.validateDeletePreviousPayments],
  controller.deletePreviousPrePayments
);

// previous transactions

previousTransactionsRouter.get('/deposits', controller.studentPreviousDeposits);

previousTransactionsRouter.get(
  '/transactions',
  controller.previousStudentTransactions
);

// previousUniPayments
previousTransactionsRouter.get(
  '/universal-payments',
  controller.previousUniPayments
);

previousTransactionsRouter.post(
  '/transfer-tuition',
  [universalInvoiceValidator.validatePushToPrepayments],
  controller.transferSingleTuitionToDeposit
);
module.exports = previousTransactionsRouter;
