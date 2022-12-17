const express = require('express');
const {
  PaymentReferenceController,
} = require('@controllers/EnrollmentAndRegistration');
const { GraduationListController } = require('@controllers/Result');
const {
  paymentReferencesValidator,
} = require('@validators/EnrollmentAndRegistration');

const paymentReferenceRouter = express.Router();
const controller = new PaymentReferenceController();
const graduationController = new GraduationListController();

paymentReferenceRouter.post(
  '/',
  [paymentReferencesValidator.validateCreatePaymentReferenceByStudent],
  controller.createPaymentReferenceByStudent
);

paymentReferenceRouter.post(
  '/select-unpaid-invoices',
  [
    paymentReferencesValidator.validateCreatePaymentReferenceForSomeOfTheUnpaidInvoices,
  ],
  controller.createPaymentReferenceForSelectedUnpaidInvoicesByStudent
);

paymentReferenceRouter.post(
  '/all-unpaid-invoices',
  [paymentReferencesValidator.validateAllUnpaidInvoices],
  controller.createPaymentReferenceForAllUnpaidInvoicesByStudent
);

paymentReferenceRouter.get(
  '/history',
  controller.getStudentPaymentReferenceRecordsByStudent
);

paymentReferenceRouter.get('/search-prn/:prn', controller.searchStudentPRN);

paymentReferenceRouter.post(
  '/future-payments',
  [paymentReferencesValidator.validateCreatePaymentReferenceForFuturePayments],
  controller.createPaymentReferenceForFuturePaymentsByStudent
);

paymentReferenceRouter.post(
  '/graduation-fees-invoice-prn/:graduationInvoiceId',
  graduationController.generatePaymentReference
);

module.exports = paymentReferenceRouter;
