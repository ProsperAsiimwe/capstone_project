const { Router } = require('express');
const studentRecordsRouter = require('./studentRecordsRoutes');
const enrollmentRouter = require('./enrollmentRoutes');
const invoiceRouter = require('./invoiceRoutes');
const paymentReferenceRouter = require('./paymentReferenceRoutes');
const registerRouter = require('./registrationRoutes');
const paymentTransactionRouter = require('./paymentTransactionRoutes');
const enrollmentAndRegistrationRouter = require('./enrollementAndRegistrationReportsRoutes');
const migratedEnrollmentRouter = require('./migratedEnrollmentsRoutes');
const fundsTransferRouter = require('./fundsTransferRoutes');

//  APP Module Endpoints
const registrationRouter = Router();

registrationRouter.use('/student-records', studentRecordsRouter);
registrationRouter.use('/enrollments', enrollmentRouter);
registrationRouter.use('/invoices', invoiceRouter);
registrationRouter.use('/payment-references', paymentReferenceRouter);
registrationRouter.use('/student-registration', registerRouter);
registrationRouter.use('/payment-transactions', paymentTransactionRouter);
registrationRouter.use(
  '/enrollment-registration',
  enrollmentAndRegistrationRouter
);

registrationRouter.use('/migrated-enrollments', migratedEnrollmentRouter);

registrationRouter.use('/funds-transfer', fundsTransferRouter);

module.exports = registrationRouter;
