const express = require('express');
const {
  AdmissionFeesPolicyController,
} = require('@controllers/InstitutionPolicy');
const {
  applicationAndAdmissionFeesValidator,
} = require('@validators/InstitutionPolicy');

const admissionFeesPolicyRouter = express.Router();
const controller = new AdmissionFeesPolicyController();

admissionFeesPolicyRouter.get('/', controller.index);

admissionFeesPolicyRouter.post(
  '/',
  [applicationAndAdmissionFeesValidator.validateCreateAdmissionFeesPolicy],
  controller.createAdmissionFeesPolicy
);

admissionFeesPolicyRouter.put(
  '/:id',
  [applicationAndAdmissionFeesValidator.validateCreateAdmissionFeesPolicy],
  controller.updateAdmissionFeesPolicy
);
admissionFeesPolicyRouter.delete('/:id', controller.deleteAdmissionFeesPolicy);

module.exports = admissionFeesPolicyRouter;
