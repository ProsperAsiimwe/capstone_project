const express = require('express');
const {
  ApplicantCertificateQualificationController,
} = require('@controllers/Admissions');
const {
  applicantCertificateQualificationValidator,
} = require('@validators/Admissions');

const applicantCertificateQualificationRouter = express.Router();
const controller = new ApplicantCertificateQualificationController();

// ApplicantCertificateQualification Routes.
applicantCertificateQualificationRouter.get('/', controller.index);

applicantCertificateQualificationRouter.post(
  '/',
  [
    applicantCertificateQualificationValidator.validateCreateApplicantCertificateQualification,
  ],
  controller.createApplicantCertificateQualification
);
applicantCertificateQualificationRouter.get(
  '/:formId',
  controller.fetchApplicantCertificateQualification
);
applicantCertificateQualificationRouter.put(
  '/:id',
  [
    applicantCertificateQualificationValidator.validateUpdateApplicantCertificateQualification,
  ],
  controller.updateApplicantCertificateQualification
);

applicantCertificateQualificationRouter.delete(
  '/:id',
  controller.deleteApplicantCertificateQualification
);

module.exports = applicantCertificateQualificationRouter;
