const express = require('express');
const { PujabApplicationController } = require('@controllers/PujabPortal');
const { pujabApplicationValidator } = require('@validators/Pujab');

const admissionRouter = express.Router();
const controller = new PujabApplicationController();

// Routes.
admissionRouter.get('/', controller.getOneActiveAdmission);
admissionRouter.get('/programmes', controller.getAdmissionProgrammes);
admissionRouter.post('/generate-prn/:formId', controller.generatePujabPRN);
admissionRouter.post(
  '/transfer-payment/:applicationId',
  [pujabApplicationValidator.validatePaymentTransferSchema],
  controller.transferPRNPayment
);
admissionRouter.post(
  '/bio-data',
  [pujabApplicationValidator.validateBioData],
  controller.createApplicationSectionData
);
admissionRouter.post(
  '/parents',
  [pujabApplicationValidator.validateParent],
  controller.createApplicationSectionData
);
admissionRouter.post(
  '/results',
  [pujabApplicationValidator.validateResult],
  controller.createApplicationSectionData
);
admissionRouter.post(
  '/previousAdmission',
  [pujabApplicationValidator.validatePreviousAdmission],
  controller.createApplicationSectionData
);
admissionRouter.post(
  '/disability',
  [pujabApplicationValidator.validateDisability],
  controller.createApplicationSectionData
);
admissionRouter.post(
  '/programme-choice',
  [pujabApplicationValidator.validateProgrammeChoice],
  controller.createApplicationSectionData
);
admissionRouter.post('/submit/:id', controller.submitApplication);
admissionRouter.get('/history', controller.getAdmissionHistory);

module.exports = admissionRouter;
