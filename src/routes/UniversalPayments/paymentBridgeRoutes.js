const express = require('express');
const {
  PaymentTransactionController,
  PaymentReferenceController,
} = require('@controllers/EnrollmentAndRegistration');
const loginRequired = require('../../app/middleware/authRoute');

const paymentBridgeRouter = express.Router();

const controller = new PaymentTransactionController();
const referenceController = new PaymentReferenceController();

paymentBridgeRouter.post(
  '/e-payments',
  controller.createBankPaymentTransaction
);

paymentBridgeRouter.get(
  '/prn-status/:prn',
  [loginRequired],
  referenceController.getPRNStatus
);

paymentBridgeRouter.delete(
  '/cancel-prn/:prn',
  [loginRequired],
  referenceController.cancelPRNStatus
);

module.exports = paymentBridgeRouter;
