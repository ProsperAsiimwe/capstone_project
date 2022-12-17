const express = require('express');
const {
  PaymentTransactionController,
} = require('@controllers/EnrollmentAndRegistration');
const {
  SearchTransactionsController,
} = require('@controllers/UniversalPayments');
const { FeesStructureController } = require('@controllers/FeesManager');

const searchController = new SearchTransactionsController();
const feesStructureController = new FeesStructureController();

const paymentTransactionRouter = express.Router();
const controller = new PaymentTransactionController();

paymentTransactionRouter.get(
  '/account-balance',
  controller.fetchStudentAccountBalanceByStudent
);
paymentTransactionRouter.get(
  '/history',
  controller.fetchAllPaymentTransactionsByStudent
);
paymentTransactionRouter.get(
  '/student-ledger',
  searchController.studentTuitionLedger
);
paymentTransactionRouter.get(
  '/fees-structure/:studentProgrammeId',
  feesStructureController.feesStructure
);
paymentTransactionRouter.get(
  '/financial-statement',
  searchController.studentFinancialStatement
);

module.exports = paymentTransactionRouter;
