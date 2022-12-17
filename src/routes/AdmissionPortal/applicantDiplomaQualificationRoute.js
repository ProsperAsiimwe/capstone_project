const express = require('express');
const {
  ApplicantDiplomaQualificationController,
} = require('@controllers/Admissions');
const {
  applicantDiplomaQualificationValidator,
} = require('@validators/Admissions');

const applicantDiplomaQualificationRouter = express.Router();
const controller = new ApplicantDiplomaQualificationController();

// ApplicantDiplomaQualification Routes.
applicantDiplomaQualificationRouter.get('/', controller.index);

applicantDiplomaQualificationRouter.post(
  '/',
  [
    applicantDiplomaQualificationValidator.validateCreateApplicantDiplomaQualification,
  ],
  controller.createApplicantDiplomaQualification
);
applicantDiplomaQualificationRouter.get(
  '/:formId',
  controller.fetchApplicantDiplomaQualification
);
applicantDiplomaQualificationRouter.put(
  '/:id',
  [
    applicantDiplomaQualificationValidator.validateUpdateApplicantDiplomaQualification,
  ],
  controller.updateApplicantDiplomaQualification
);

applicantDiplomaQualificationRouter.delete(
  '/:id',
  controller.deleteApplicantDiplomaQualification
);

module.exports = applicantDiplomaQualificationRouter;
