const express = require('express');
const { InvoiceController } = require('@controllers/EnrollmentAndRegistration');
const { invoiceValidator } = require('@validators/EnrollmentAndRegistration');
const { GraduationFeesController } = require('@controllers/FeesManager');
const { GraduationInvoiceController } = require('@controllers/Result');

const controllerGrad = new GraduationFeesController();
const invoiceGrad = new GraduationInvoiceController();

const invoiceRouter = express.Router();
const controller = new InvoiceController();

invoiceRouter.post(
  '/other-fees-invoice',
  [invoiceValidator.validateCreateOtherFeesInvoiceByStudent],
  controller.createOtherFeesInvoiceByStudent
);

invoiceRouter.get('/graduation', controllerGrad.graduationInvoiceStudent);

invoiceRouter.post(
  '/generate-grad-invoice',
  invoiceGrad.generateGraduationInvoice
);

invoiceRouter.post(
  '/allocate-to-one-invoice/:invoice_id',
  [invoiceValidator.validateAllocateMoneyToOneInvoiceByStudent],
  controller.allocateMoneyToInvoice
);

invoiceRouter.get(
  '/tuition-invoice-elements/:tuition_invoice_id',
  controller.fetchTuitionInvoiceFeesElements
);
invoiceRouter.get(
  '/functional-invoice-elements/:functional_invoice_id',
  controller.fetchFunctionalInvoiceFeesElements
);
invoiceRouter.get(
  '/other-fees-invoice-elements/:other_fees_invoice_id',
  controller.fetchOtherFeesInvoiceFeesElements
);
invoiceRouter.get(
  '/manual-invoice-elements/:manual_invoice_id',
  controller.fetchManualInvoiceFeesElements
);

invoiceRouter.post(
  '/allocate-money-to-invoice/:transactionId',
  [invoiceValidator.validateAllocateMoneyToInvoiceByStudent],
  controller.allocateMoneyToInvoiceByStudent
);

invoiceRouter.get('/', controller.fetchAllInvoices);

module.exports = invoiceRouter;
