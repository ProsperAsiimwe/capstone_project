const express = require('express');
const { ApplicantALevelDataController } = require('@controllers/Admissions');
const { applicantALevelDataValidator } = require('@validators/Admissions');

const applicantALevelDataRouter = express.Router();
const controller = new ApplicantALevelDataController();

// ApplicantALevelData Routes.
applicantALevelDataRouter.get('/', controller.index);

applicantALevelDataRouter.post(
  '/',
  [applicantALevelDataValidator.validateCreateApplicantALevelData],
  controller.createApplicantALevelData
);
applicantALevelDataRouter.put(
  '/',
  [applicantALevelDataValidator.validateUpdateApplicantALevelData],
  controller.updateApplicantALevelData
);
applicantALevelDataRouter.get('/:formId', controller.fetchApplicantALevelData);

module.exports = applicantALevelDataRouter;
