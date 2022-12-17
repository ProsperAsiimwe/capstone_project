const express = require('express');
const {
  ReceivableController,
  UniversalInvoiceController,
  StudentPaymentController,
} = require('@controllers/UniversalPayments');
const {
  universalInvoiceValidator,
  studentPaymentsValidator,
} = require('@validators/UniversalPayments');

const chartOfAccountRouter = express.Router();
const controller = new ReceivableController();
const invoiceController = new UniversalInvoiceController();
const studentPaymentController = new StudentPaymentController();

chartOfAccountRouter.get('/receivables', controller.indexPortal);
chartOfAccountRouter.get('/online-payments', controller.handleOnlinePayment);

chartOfAccountRouter.get(
  '/find-invoice/:invoiceNumber',
  invoiceController.fetchUniversalInvoiceByInvoiceNumber
);

chartOfAccountRouter.post(
  '/generate-reference',
  [universalInvoiceValidator.validateCreateUniversalInvoice],
  invoiceController.createUniversalInvoice
);

chartOfAccountRouter.post(
  '/generate-student-payment-reference',
  [studentPaymentsValidator.validateCreateStudentPayment],
  studentPaymentController.createStudentPayment
);

chartOfAccountRouter.post(
  '/generate-reference/:id',
  invoiceController.generatePaymentReferenceWithInvoiceNumber
);

module.exports = chartOfAccountRouter;
