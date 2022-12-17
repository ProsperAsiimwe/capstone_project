const express = require('express');
const { ApplicantOLevelDataController } = require('@controllers/Admissions');
const { applicantOLevelDataValidator } = require('@validators/Admissions');

const applicantOLevelDataRouter = express.Router();
const controller = new ApplicantOLevelDataController();

// ApplicantOLevelData Routes.
applicantOLevelDataRouter.get('/', controller.index);

applicantOLevelDataRouter.post(
  '/',
  [applicantOLevelDataValidator.validateCreateApplicantOLevelData],
  controller.createApplicantOLevelData
);
applicantOLevelDataRouter.put(
  '/',
  [applicantOLevelDataValidator.validateUpdateApplicantOLevelData],
  controller.updateApplicantOLevelData
);
applicantOLevelDataRouter.get('/:formId', controller.fetchApplicantOLevelData);

module.exports = applicantOLevelDataRouter;
