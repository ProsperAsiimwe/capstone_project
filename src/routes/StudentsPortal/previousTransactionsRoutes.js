const express = require('express');

const {
  PreviousTransactionsController,
} = require('@controllers/UniversalPayments');

const previousTransactionsRouter = express.Router();

const previousTransactions = new PreviousTransactionsController();

// previous transactions
previousTransactionsRouter.get(
  '/deposits/:id',
  previousTransactions.previousDeposits
);
previousTransactionsRouter.get(
  '/transactions/:id',
  previousTransactions.previousTransactions
);

module.exports = previousTransactionsRouter;
