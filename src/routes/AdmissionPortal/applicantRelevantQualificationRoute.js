const express = require('express');
const {
  ApplicantRelevantQualificationController,
} = require('@controllers/Admissions');
const {
  applicantRelevantQualificationValidator,
} = require('@validators/Admissions');

const applicantRelevantQualificationRouter = express.Router();
const controller = new ApplicantRelevantQualificationController();

// ApplicantRelevantQualification Routes.
applicantRelevantQualificationRouter.get('/', controller.index);

applicantRelevantQualificationRouter.post(
  '/',
  [
    applicantRelevantQualificationValidator.validateCreateApplicantRelevantQualification,
  ],
  controller.createApplicantRelevantQualification
);
applicantRelevantQualificationRouter.get(
  '/:formId',
  controller.fetchApplicantRelevantQualification
);
applicantRelevantQualificationRouter.put(
  '/:id',
  [
    applicantRelevantQualificationValidator.validateUpdateApplicantRelevantQualification,
  ],
  controller.updateApplicantRelevantQualification
);

applicantRelevantQualificationRouter.delete(
  '/:id',
  controller.deleteApplicantRelevantQualification
);

module.exports = applicantRelevantQualificationRouter;
