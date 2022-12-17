const express = require('express');
const {
  ApplicantProgrammeChoiceController,
} = require('@controllers/Admissions');
const { applicantProgrammeChoiceValidator } = require('@validators/Admissions');

const applicantProgrammeChoiceRouter = express.Router();
const controller = new ApplicantProgrammeChoiceController();

// ApplicantProgrammeChoice Routes.
applicantProgrammeChoiceRouter.get('/', controller.index);

applicantProgrammeChoiceRouter.post(
  '/',
  [applicantProgrammeChoiceValidator.validateCreateApplicantProgrammeChoice],
  controller.createApplicantProgrammeChoice
);
applicantProgrammeChoiceRouter.get(
  '/:formId',
  controller.fetchApplicantProgrammeChoice
);
applicantProgrammeChoiceRouter.put(
  '/:id',
  [applicantProgrammeChoiceValidator.validateUpdateApplicantProgrammeChoice],
  controller.updateApplicantProgrammeChoice
);

module.exports = applicantProgrammeChoiceRouter;
