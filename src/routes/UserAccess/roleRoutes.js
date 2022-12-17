const express = require('express');
const {
  UserRoleController,
  UserRoleBoundController,
} = require('@controllers/UserAccess');
const { userRoleValidator } = require('@validators/UserAccess');

const userRoleRouter = express.Router();
const controller = new UserRoleController();
const boundController = new UserRoleBoundController();

// Role Management Routes.
userRoleRouter.get('/', [], controller.index);
userRoleRouter.post(
  '/',
  [userRoleValidator.validateCreateRole],
  controller.createRole
);
userRoleRouter.post(
  '/apps/:roleId',
  [userRoleValidator.validateAddRoleApps],
  controller.addRoleAppsWithFunctions
);

userRoleRouter.put(
  '/update-access-domain',
  [userRoleValidator.validateUpdateAccessDomain],
  controller.updateUserAccessDomain
);

userRoleRouter.get(
  '/user-bounds/:userId/:roleId',
  boundController.getUserRoleBoundValueLevels
);

userRoleRouter.post(
  '/user/:id',
  [userRoleValidator.validateAddUserRoles],
  controller.addRolesToUser
);
userRoleRouter.post(
  '/role/:id',
  [userRoleValidator.validateAssignRoleToUser],
  controller.assignRoleToUser
);
userRoleRouter.get('/:id', [], controller.fetchRole);
userRoleRouter.put(
  '/:roleId',
  [userRoleValidator.validateUpdateRole],
  controller.updateRole
);

userRoleRouter.delete(
  '/remove-role-app-functions',
  [userRoleValidator.validateRemoveRoleAppFunctions],
  controller.removeRoleAppFunctions
);

userRoleRouter.delete(
  '/remove-group-role-apps',
  [userRoleValidator.validateRemoveRoleUserRoleGroupApps],
  controller.removeGroupRoleApps
);

userRoleRouter.delete(
  '/remove-group-role-group-apps',
  [userRoleValidator.validateRemoveUserRoleGroupApps],
  controller.removeUserRoleGroupApps
);

userRoleRouter.delete('/:roleId', controller.deleteRole);

module.exports = userRoleRouter;
