const express = require('express');
const { BulkPaymentController } = require('@controllers/UniversalPayments');
const loginRequired = require('../../app/middleware/authRoute');

const bulkPaymentRouter = express.Router();

const controller = new BulkPaymentController();

bulkPaymentRouter.get(
  '/pending-bulk-payments',
  [loginRequired],
  controller.allPendingBulkPayments
);

bulkPaymentRouter.get(
  '/acknowledged-bulk-payments',
  [loginRequired],
  controller.allAcknowledgedBulkPayments
);

bulkPaymentRouter.get(
  '/refresh-bulk-payments',
  [loginRequired],
  controller.refresh
);

bulkPaymentRouter.post(
  '/generate-prn/:bulkPaymentId',
  [loginRequired],
  controller.generatePaymentReferenceNumberForBulkPayment
);

bulkPaymentRouter.post('/create-bulk-payment', controller.createBulkPayment);

module.exports = bulkPaymentRouter;
