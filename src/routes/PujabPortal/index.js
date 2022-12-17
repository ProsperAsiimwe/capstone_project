const { Router } = require('express');

const applicantLoginRequired = require('../../app/middleware/authRoutePujabApplicant');
const authenticationRouter = require('./authentication');
const admissionRouter = require('./applicantAdmissionRoutes');

const pujabApplicantRouter = Router();

pujabApplicantRouter.use('/', authenticationRouter);
pujabApplicantRouter.use(
  '/applications',
  [applicantLoginRequired],
  admissionRouter
);

module.exports = pujabApplicantRouter;
