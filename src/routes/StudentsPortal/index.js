const { Router } = require('express');
const authRouter = require('./authentication');
const metadataRouter = require('./metadata');
const enrollmentRouter = require('./enrollmentRoutes');
const paymentReferenceRouter = require('./paymentReferenceRoutes');
const invoiceRouter = require('./invoiceRoutes');
const registrationRouter = require('./registrationRoutes');
const otherFeesPolicy = require('./otherFeesPolicyRoutes');
const registrationPolicy = require('./registrationPolicyRoutes');
const paymentTransactionRouter = require('./paymentTransactionRoutes');
const previousTransactionsRouter = require('./previousTransactionsRoutes');
const studentLoginRequired = require('../../app/middleware/authRouteStudent');
const resultsRouter = require('./resultRoutes');
const serviceRoutes = require('./serviceRoutes');

// Students' Portal API Endpoints
const studentPortalMgtRouter = Router();

studentPortalMgtRouter.use('/metadata', [studentLoginRequired], metadataRouter);
studentPortalMgtRouter.use('/auth', authRouter);
studentPortalMgtRouter.use(
  '/enrollment',
  [studentLoginRequired],
  enrollmentRouter
);
studentPortalMgtRouter.use(
  '/payment-references',
  [studentLoginRequired],
  paymentReferenceRouter
);
studentPortalMgtRouter.use('/invoices', [studentLoginRequired], invoiceRouter);

studentPortalMgtRouter.use(
  '/registration',
  [studentLoginRequired],
  registrationRouter
);

studentPortalMgtRouter.use(
  '/registration-policies',
  [studentLoginRequired],
  registrationPolicy
);

studentPortalMgtRouter.use(
  '/other-fees-policies',
  [studentLoginRequired],
  otherFeesPolicy
);

studentPortalMgtRouter.use(
  '/payment-transactions',
  [studentLoginRequired],
  paymentTransactionRouter
);

studentPortalMgtRouter.use(
  '/previous-transactions',
  [studentLoginRequired],
  previousTransactionsRouter
);

studentPortalMgtRouter.use('/result', [studentLoginRequired], resultsRouter);
studentPortalMgtRouter.use('/services', [studentLoginRequired], serviceRoutes);

module.exports = studentPortalMgtRouter;
