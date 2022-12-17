const express = require('express');
const { ApplicantController } = require('@controllers/index');
const { ApplicantAuthController } = require('@controllers/index');
const { applicantValidator } = require('@validators/Admissions');

const applicantRouter = express.Router();
const controller = new ApplicantController();
const authController = new ApplicantAuthController();

// Applicant Management Routes.
applicantRouter.get('/my-forms', [], controller.fetchAllApplicantForms);
// update applicants
applicantRouter.put(
  '/update-profile',
  [applicantValidator.validateUpdateApplicant],
  authController.updateApplicant
);

module.exports = applicantRouter;
