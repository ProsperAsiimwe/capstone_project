const express = require('express');
const {
  ApplicantOtherQualificationController,
} = require('@controllers/Admissions');
const {
  applicantOtherQualificationValidator,
} = require('@validators/Admissions');

const applicantOtherQualificationRouter = express.Router();
const controller = new ApplicantOtherQualificationController();

// ApplicantOtherQualification Routes.
applicantOtherQualificationRouter.get('/', controller.index);

applicantOtherQualificationRouter.post(
  '/',
  [
    applicantOtherQualificationValidator.validateCreateApplicantOtherQualification,
  ],
  controller.createApplicantOtherQualification
);
applicantOtherQualificationRouter.get(
  '/:formId',
  controller.fetchApplicantOtherQualification
);
applicantOtherQualificationRouter.put(
  '/:id',
  [
    applicantOtherQualificationValidator.validateUpdateApplicantOtherQualification,
  ],
  controller.updateApplicantOtherQualification
);

applicantOtherQualificationRouter.delete(
  '/:id',
  controller.deleteApplicantOtherQualification
);

module.exports = applicantOtherQualificationRouter;
