const express = require('express');
const { SecurityProfileController } = require('@controllers/UserAccess');
const { securityProfileValidator } = require('@validators/UserAccess');

const securityProfileRouter = express.Router();
const controller = new SecurityProfileController();

// SecurityProfile Management Routes.
securityProfileRouter.get('/', [], controller.index);
securityProfileRouter.post(
  '/',
  [securityProfileValidator.validateCreateSecurityProfile],
  controller.createSecurityProfile
);
securityProfileRouter.get('/:id', [], controller.fetchSecurityProfile);
securityProfileRouter.put(
  '/:id',
  [securityProfileValidator.validateUpdateSecurityProfile],
  controller.updateSecurityProfile
);
securityProfileRouter.delete('/:id', controller.deleteSecurityProfile);

module.exports = securityProfileRouter;
