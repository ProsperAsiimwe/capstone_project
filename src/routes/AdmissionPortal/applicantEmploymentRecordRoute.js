const express = require('express');
const {
  applicantEmploymentRecordController,
} = require('@controllers/Admissions');
const {
  applicantEmploymentRecordValidator,
} = require('@validators/Admissions');

const applicantEmploymentRecordRouter = express.Router();
const controller = new applicantEmploymentRecordController();

// ApplicantEmploymentRecord Routes.
applicantEmploymentRecordRouter.get('/', controller.index);

applicantEmploymentRecordRouter.post(
  '/',
  [applicantEmploymentRecordValidator.validateCreateApplicantEmploymentRecord],
  controller.createApplicantEmploymentRecord
);
applicantEmploymentRecordRouter.get(
  '/:formId',
  controller.fetchApplicantEmploymentRecord
);
applicantEmploymentRecordRouter.put(
  '/:id',
  [applicantEmploymentRecordValidator.validateUpdateApplicantEmploymentRecord],
  controller.updateApplicantEmploymentRecord
);
applicantEmploymentRecordRouter.delete(
  '/:id',
  controller.deleteApplicantEmploymentRecord
);

module.exports = applicantEmploymentRecordRouter;
