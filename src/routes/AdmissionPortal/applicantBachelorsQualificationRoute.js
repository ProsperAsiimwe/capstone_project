const express = require('express');
const {
  ApplicantBachelorsQualificationController,
} = require('@controllers/Admissions');
const {
  applicantBachelorsQualificationValidator,
} = require('@validators/Admissions');

const applicantBachelorsQualificationRouter = express.Router();
const controller = new ApplicantBachelorsQualificationController();

// ApplicantBachelorsQualification Routes.
applicantBachelorsQualificationRouter.get('/', controller.index);

applicantBachelorsQualificationRouter.post(
  '/',
  [
    applicantBachelorsQualificationValidator.validateCreateApplicantBachelorsQualification,
  ],
  controller.createApplicantBachelorsQualification
);
applicantBachelorsQualificationRouter.get(
  '/:formId',
  controller.fetchApplicantBachelorsQualification
);
applicantBachelorsQualificationRouter.put(
  '/:id',
  [
    applicantBachelorsQualificationValidator.validateUpdateApplicantBachelorsQualification,
  ],
  controller.updateApplicantBachelorsQualification
);

applicantBachelorsQualificationRouter.delete(
  '/:id',
  controller.deleteApplicantBachelorsQualification
);

module.exports = applicantBachelorsQualificationRouter;
