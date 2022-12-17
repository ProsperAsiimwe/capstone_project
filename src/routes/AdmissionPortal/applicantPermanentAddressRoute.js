const express = require('express');
const {
  applicantPermanentAddressController,
} = require('@controllers/Admissions');
const {
  applicantPermanentAddressValidator,
} = require('@validators/Admissions');

const applicantPermanentAddressRouter = express.Router();
const controller = new applicantPermanentAddressController();

// ApplicantPermanentAddress Routes.
applicantPermanentAddressRouter.get('/', controller.index);

applicantPermanentAddressRouter.post(
  '/',
  [applicantPermanentAddressValidator.validateCreateApplicantPermanentAddress],
  controller.createApplicantPermanentAddress
);
applicantPermanentAddressRouter.get(
  '/:formId',
  controller.fetchApplicantPermanentAddress
);
applicantPermanentAddressRouter.put(
  '/:id',
  [applicantPermanentAddressValidator.validateUpdateApplicantPermanentAddress],
  controller.updateApplicantPermanentAddress
);

module.exports = applicantPermanentAddressRouter;
