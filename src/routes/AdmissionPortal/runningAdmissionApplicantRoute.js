const express = require('express');
const {
  RunningAdmissionApplicantController,
} = require('@controllers/Admissions');
const {
  runningAdmissionApplicantValidator,
} = require('@validators/Admissions');

const runningAdmissionApplicantRouter = express.Router();
const controller = new RunningAdmissionApplicantController();

// RunningAdmissionApplicant Routes.

runningAdmissionApplicantRouter.post(
  '/',
  [runningAdmissionApplicantValidator.validateCreateRunningAdmissionApplicant],
  controller.createRunningAdmissionApplicant
);
runningAdmissionApplicantRouter.post(
  '/generate-prn/:formId',
  controller.generatePRN
);
runningAdmissionApplicantRouter.put('/:form_id', controller.submitApplication);

runningAdmissionApplicantRouter.get(
  '/:running_admission_id',
  controller.fetchRunningAdmissionApplicantByRunningAdmissionId
);

runningAdmissionApplicantRouter.get(
  '/form/:form_id',
  controller.fetchRunningAdmissionApplicantByFormId
);

runningAdmissionApplicantRouter.get(
  '/applicant-form/:formId',
  controller.fetchApplicantFormByApplicant
);

runningAdmissionApplicantRouter.get(
  '/print-admission-letter/:formId',
  controller.downloadApplicantAdmissionLetter
);

runningAdmissionApplicantRouter.post(
  '/download-form/:formId',
  controller.downloadFilledFormByApplicant
);

module.exports = runningAdmissionApplicantRouter;
