const express = require('express');
const { applicantRefereeDetailController } = require('@controllers/Admissions');
const { applicantRefereeDetailValidator } = require('@validators/Admissions');

const applicantRefereeDetailRouter = express.Router();
const controller = new applicantRefereeDetailController();

// ApplicantRefereeDetail Routes.
applicantRefereeDetailRouter.get('/', controller.index);

applicantRefereeDetailRouter.post(
  '/',
  [applicantRefereeDetailValidator.validateCreateApplicantRefereeDetail],
  controller.createApplicantRefereeDetail
);
applicantRefereeDetailRouter.get(
  '/:form_id',
  controller.fetchApplicantRefereeDetail
);
applicantRefereeDetailRouter.put(
  '/:id',
  [applicantRefereeDetailValidator.validateUpdateApplicantRefereeDetail],
  controller.updateApplicantRefereeDetail
);
applicantRefereeDetailRouter.delete(
  '/:id',
  controller.deleteApplicantRefereeDetail
);

module.exports = applicantRefereeDetailRouter;
