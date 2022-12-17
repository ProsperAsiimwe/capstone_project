const express = require('express');
const { ApplicantBioDataController } = require('@controllers/Admissions');
const { applicantBioDataValidator } = require('@validators/Admissions');

const applicantBioDataRouter = express.Router();
const controller = new ApplicantBioDataController();

// ApplicantBioData Routes.
applicantBioDataRouter.get('/', controller.index);

applicantBioDataRouter.post(
  '/',
  [applicantBioDataValidator.validateCreateApplicantBioData],
  controller.createApplicantBioData
);
applicantBioDataRouter.get('/:formId', controller.fetchApplicantBioData);
applicantBioDataRouter.put(
  '/:id',
  [applicantBioDataValidator.validateUpdateApplicantBioData],
  controller.updateApplicantBioData
);

module.exports = applicantBioDataRouter;
