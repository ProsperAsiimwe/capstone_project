const express = require('express');
const {
  RunningAdmissionApplicantController,
} = require('@controllers/Admissions');

const admissionProgrammesRouter = express.Router();
const controller = new RunningAdmissionApplicantController();

admissionProgrammesRouter.get('/', controller.applicantAdmissionProgrammes);

module.exports = admissionProgrammesRouter;
