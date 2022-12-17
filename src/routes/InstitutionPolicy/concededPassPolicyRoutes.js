const express = require('express');
const {
  ConcededPassPolicyController,
} = require('@controllers/InstitutionPolicy');
const {
  concededPassPolicyValidator,
} = require('@validators/InstitutionPolicy');

const concededPassPolicyRouter = express.Router();

const controller = new ConcededPassPolicyController();

concededPassPolicyRouter.get('/', controller.index);

concededPassPolicyRouter.post(
  '/',
  [concededPassPolicyValidator.validateCreateConcededPassPolicyPolicy],
  controller.create
);

concededPassPolicyRouter.get('/:concededPassPolicyId', controller.findOne);

concededPassPolicyRouter.put(
  '/:concededPassPolicyId',
  [concededPassPolicyValidator.validateUpdateConcededPassPolicyPolicy],
  controller.update
);

concededPassPolicyRouter.delete('/:concededPassPolicyId', controller.destroy);

module.exports = concededPassPolicyRouter;
