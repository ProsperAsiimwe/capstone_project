const express = require('express');
const { ApplicantController } = require('@controllers/index');

const admissionRouter = express.Router();

const applicantController = new ApplicantController();

admissionRouter.get('/', applicantController.getApplicantAdmissions);

admissionRouter.get(
  '/download/:formId',
  applicantController.downloadApplicantAdmissionLetter
);
module.exports = admissionRouter;
