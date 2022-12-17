const { Router } = require('express');
const loginRequired = require('../../app/middleware/authRoute');
const chartOfAccountRoutes = require('./chartOfAccountRoutes');
const receivableRoutes = require('./receivableRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const universalPaymentPortalRoutes = require('./universalPaymentPortalRoutes');
const uniPayReportsRoutes = require('./reportsRoutes');

const paymentBridgeRoutes = require('./paymentBridgeRoutes');
const bulkPaymentRoutes = require('./bulkPaymentRoutes');
const uraPaymentTransactionRoutes = require('./uraPaymentTransactionRoutes');
const reportsRoutes = require('./reportUniPayRoutes');
const sponsorRoutes = require('./sponsorRoutes');
const previousTransactionsRoutes = require('./previousTransactionsRoutes');
//  Universal Payment API Endpoints
const universalPaymentMgtRouter = Router();

universalPaymentMgtRouter.use(
  '/chart-of-accounts',
  [loginRequired],
  chartOfAccountRoutes
);

universalPaymentMgtRouter.use(
  '/receivables',
  [loginRequired],
  receivableRoutes
);

universalPaymentMgtRouter.use('/invoices', [loginRequired], invoiceRoutes);
universalPaymentMgtRouter.use('/portal', universalPaymentPortalRoutes);
universalPaymentMgtRouter.use('/bridge', paymentBridgeRoutes);
universalPaymentMgtRouter.use('/bulk-payments', bulkPaymentRoutes);
universalPaymentMgtRouter.use(
  '/payment-transactions',
  uraPaymentTransactionRoutes
);

universalPaymentMgtRouter.use(
  '/transaction-reports',
  [loginRequired],
  uniPayReportsRoutes
);
universalPaymentMgtRouter.use('/reports', [loginRequired], reportsRoutes);
universalPaymentMgtRouter.use('/sponsors', [loginRequired], sponsorRoutes);
universalPaymentMgtRouter.use(
  '/previous-transactions',
  [loginRequired],
  previousTransactionsRoutes
);

module.exports = universalPaymentMgtRouter;
