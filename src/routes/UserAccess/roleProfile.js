const express = require('express');
const { UserRoleController } = require('@controllers/UserAccess');
const { userRoleValidator } = require('@validators/UserAccess');
const { RoleProfileController } = require('@controllers/UserAccess');

const roleProfileRouter = express.Router();
const controller = new UserRoleController();
const roleProfileController = new RoleProfileController();

// Role Management Routes.
roleProfileRouter.get('/', [], roleProfileController.index);
roleProfileRouter.post(
  '/',
  [userRoleValidator.validateCreateRole],
  controller.createRole
);
roleProfileRouter.get('/:id', [], controller.fetchRole);
roleProfileRouter.put(
  '/:id',
  [userRoleValidator.validateUpdateRole],
  controller.updateRole
);
roleProfileRouter.delete('/:id', controller.deleteRole);

module.exports = roleProfileRouter;
