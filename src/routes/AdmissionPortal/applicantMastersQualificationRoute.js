const express = require('express');
const {
  ApplicantMastersQualificationController,
} = require('@controllers/Admissions');
const {
  applicantMastersQualificationValidator,
} = require('@validators/Admissions');

const applicantMastersQualificationRouter = express.Router();
const controller = new ApplicantMastersQualificationController();

// ApplicantMastersQualification Routes.
applicantMastersQualificationRouter.get('/', controller.index);

applicantMastersQualificationRouter.post(
  '/',
  [
    applicantMastersQualificationValidator.validateCreateApplicantMastersQualification,
  ],
  controller.createApplicantMastersQualification
);
applicantMastersQualificationRouter.get(
  '/:formId',
  controller.fetchApplicantMastersQualification
);
applicantMastersQualificationRouter.put(
  '/:id',
  [
    applicantMastersQualificationValidator.validateUpdateApplicantMastersQualification,
  ],
  controller.updateApplicantMastersQualification
);

applicantMastersQualificationRouter.delete(
  '/:id',
  controller.deleteApplicantMastersQualification
);

module.exports = applicantMastersQualificationRouter;
