const express = require('express');
const { RunningAdmissionController } = require('@controllers/Admissions');
const {
  RunningAdmissionApplicantController,
} = require('@controllers/Admissions');

const runningAdmissionRouter = express.Router();
const controller = new RunningAdmissionController();
const controllerApplicant = new RunningAdmissionApplicantController();

// RunningAdmissions Routes For The Applicants.
runningAdmissionRouter.get('/', controller.applicantIndex);

runningAdmissionRouter.get(
  '/:id',
  controller.fetchRunningAdmissionForApplicant
);

runningAdmissionRouter.get(
  '/programmes/:id',
  controllerApplicant.findRunningAdmissionProgrammeApplicantContext
);

// findRunningAdmissionProgrammeApplicantContext;
module.exports = runningAdmissionRouter;
