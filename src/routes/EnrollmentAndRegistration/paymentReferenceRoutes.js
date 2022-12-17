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
  [paymentReferencesValidator.validateCreatePaymentReferenceByStaff],
  controller.createPaymentReferenceForSpecificEnrollmentRecordByStaff
);

paymentReferenceRouter.get(
  '/history/:student_id',
  controller.getStudentPaymentReferenceRecordsByStaff
);

paymentReferenceRouter.post(
  '/all-unpaid-invoices/:student_id',
  [paymentReferencesValidator.validateAllUnpaidInvoices],
  controller.createPaymentReferenceForAllUnpaidInvoicesByStaff
);

paymentReferenceRouter.post(
  '/select-unpaid-invoices/:student_id',
  [
    paymentReferencesValidator.validateCreatePaymentReferenceForSomeOfTheUnpaidInvoices,
  ],
  controller.createPaymentReferenceForSelectedUnpaidInvoices
);

paymentReferenceRouter.post(
  '/future-payments/:student_id',
  [paymentReferencesValidator.validateCreatePaymentReferenceForFuturePayments],
  controller.createPaymentReferenceForFuturePayments
);

paymentReferenceRouter.post(
  '/graduation-fees-invoice-prn/:graduationInvoiceId',
  graduationController.generatePaymentReference
);

module.exports = paymentReferenceRouter;
