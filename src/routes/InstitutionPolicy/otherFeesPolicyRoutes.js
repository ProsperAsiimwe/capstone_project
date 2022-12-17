const express = require('express');
const { OtherFeesPolicyController } = require('@controllers/InstitutionPolicy');
const { otherFeesPolicyValidator } = require('@validators/InstitutionPolicy');

const otherFeesPolicyRouter = express.Router();
const controller = new OtherFeesPolicyController();

otherFeesPolicyRouter.post(
  '/',
  [otherFeesPolicyValidator.validateCreateOtherFeesPolicy],
  controller.createOtherFeesPolicy
);

otherFeesPolicyRouter.get('/', controller.index);

otherFeesPolicyRouter.put(
  '/:id',
  [otherFeesPolicyValidator.validateUpdateOtherFeesPolicy],
  controller.updateOtherFeesPolicy
);
otherFeesPolicyRouter.delete('/:id', controller.deleteOtherFeesPolicy);

module.exports = otherFeesPolicyRouter;
