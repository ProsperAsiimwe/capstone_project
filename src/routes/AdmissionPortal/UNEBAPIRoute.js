const express = require('express');
const { UnebAPIController } = require('@controllers/AdmissionPortal');
const { UnebSubjectController } = require('@controllers/index');
const { applicantUNEBAPIValidator } = require('@validators/Admissions');

const UNEBRouter = express.Router();
const UNEBController = new UnebAPIController();
const UNEBSubjectController = new UnebSubjectController();

UNEBRouter.post(
  '/',
  [applicantUNEBAPIValidator.validateGetApplicantResult],
  UNEBController.checkResult
);
UNEBRouter.get('/uneb-subjects', UNEBSubjectController.indexApplicantSide);

module.exports = UNEBRouter;
