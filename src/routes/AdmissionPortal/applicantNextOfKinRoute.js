const express = require('express');
const { applicantNextOfKinController } = require('@controllers/Admissions');
const { applicantNextOfKinValidator } = require('@validators/Admissions');

const applicantNextOfKinRouter = express.Router();
const controller = new applicantNextOfKinController();

// ApplicantNextOfKin Routes.
applicantNextOfKinRouter.get('/', controller.index);

applicantNextOfKinRouter.post(
  '/',
  [applicantNextOfKinValidator.validateCreateApplicantNextOfKin],
  controller.createApplicantNextOfKin
);
applicantNextOfKinRouter.get('/:formId', controller.fetchApplicantNextOfKin);
applicantNextOfKinRouter.put(
  '/:id',
  [applicantNextOfKinValidator.validateUpdateApplicantNextOfKin],
  controller.updateApplicantNextOfKin
);

module.exports = applicantNextOfKinRouter;
