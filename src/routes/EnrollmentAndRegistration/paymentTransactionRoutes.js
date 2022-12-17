const express = require('express');
const {
  PaymentTransactionController,
} = require('@controllers/EnrollmentAndRegistration');
const {
  paymentTransactionValidator,
} = require('@validators/EnrollmentAndRegistration');

const paymentTransactionRouter = express.Router();
const controller = new PaymentTransactionController();

paymentTransactionRouter.post(
  '/direct-post',
  [paymentTransactionValidator.validateCreateDirectPaymentTransaction],
  controller.createDirectPostTransaction
);

paymentTransactionRouter.post(
  '/download-direct-post-template',
  controller.downloadDirectPostTemplate
);

paymentTransactionRouter.post(
  '/upload-direct-post-template',
  controller.uploadDirectPostTemplate
);

paymentTransactionRouter.post(
  '/fix-ura-unpinged-transactions',
  controller.fixUraUnpingedTransactions
);

paymentTransactionRouter.put(
  '/direct-post/:id',
  [paymentTransactionValidator.validateUpdatePaymentTransaction],
  controller.updateRecord
);

paymentTransactionRouter.put(
  '/approve-pending-direct-posts',
  [paymentTransactionValidator.validateApprovePaymentTransaction],
  controller.approvePaymentTransactions
);

paymentTransactionRouter.delete(
  '/delete-pending-direct-posts',
  [paymentTransactionValidator.validateApprovePaymentTransaction],
  controller.deletePaymentTransactions
);

paymentTransactionRouter.get(
  '/pending-direct-posts',
  controller.fetchAllPendingPaymentTransactions
);

paymentTransactionRouter.get(
  '/history/:student_id',
  controller.fetchAllPaymentTransactions
);

paymentTransactionRouter.get(
  '/account-balance/:student_id',
  controller.fetchStudentAccountBalanceByStaff
);

paymentTransactionRouter.get(
  '/unallocated-transactions/:student_id',
  controller.getAllTransactionsWithUnallocatedMoney
);

paymentTransactionRouter.post(
  '/allocate-money-to-invoices/:payment_transaction_id',
  [paymentTransactionValidator.validateAllocateMoneyToInvoices],
  controller.allocateMoneyToInvoices
);

paymentTransactionRouter.post(
  '/request-refund/:student_id',
  [paymentTransactionValidator.validateRefundRequest],
  controller.refundRequest
);

paymentTransactionRouter.post(
  '/approve-request-to-refund/:request_id',
  [paymentTransactionValidator.validateApproveRefundRequest],
  controller.approveRefundRequest
);

paymentTransactionRouter.post(
  '/refund/:request_id',
  [paymentTransactionValidator.validateApproveRefundRequest],
  controller.refund
);

paymentTransactionRouter.delete('/:id', controller.deleteRecord);

module.exports = paymentTransactionRouter;
