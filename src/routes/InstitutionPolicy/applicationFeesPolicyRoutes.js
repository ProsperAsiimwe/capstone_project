const express = require('express');
const {
  ApplicationFeesPolicyController,
} = require('@controllers/InstitutionPolicy');
const {
  applicationAndAdmissionFeesValidator,
} = require('@validators/InstitutionPolicy');

const applicationFeesPolicyRouter = express.Router();
const controller = new ApplicationFeesPolicyController();

applicationFeesPolicyRouter.get('/', controller.index);

applicationFeesPolicyRouter.post(
  '/',
  [applicationAndAdmissionFeesValidator.validateCreateApplicationFeesPolicy],
  controller.createApplicationFeesPolicy
);

applicationFeesPolicyRouter.put(
  '/:id',
  [applicationAndAdmissionFeesValidator.validateCreateApplicationFeesPolicy],
  controller.updateApplicationFeesPolicy
);
applicationFeesPolicyRouter.delete(
  '/:id',
  controller.deleteApplicationFeesPolicy
);

module.exports = applicationFeesPolicyRouter;
