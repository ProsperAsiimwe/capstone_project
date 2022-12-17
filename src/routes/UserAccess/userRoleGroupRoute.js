const express = require('express');
const {
  UserRoleGroupController,
  UserRoleBoundController,
} = require('@controllers/UserAccess');
const { userRoleGroupValidator } = require('@validators/UserAccess');

const userRoleGroupRouter = express.Router();
const controller = new UserRoleGroupController();

const boundController = new UserRoleBoundController();

// UserRoleGroup Management Routes.
userRoleGroupRouter.get('/', [], controller.index);
userRoleGroupRouter.post(
  '/',
  [userRoleGroupValidator.validateCreateUserRoleGroup],
  controller.createUserRoleGroup
);
// userRoleBound
userRoleGroupRouter.get('/users', controller.userRoleBound);

userRoleGroupRouter.get(
  '/user-bounds',
  boundController.userBoundValueFunctions
);

// role group users
userRoleGroupRouter.get('/users/:id', controller.roleGroupUsers);

userRoleGroupRouter.post('/apps/:id', [], controller.addRoleGroupApps);
userRoleGroupRouter.delete('/apps/:id', [], controller.dropRoleGroupApps);
userRoleGroupRouter.post('/admins/:id', [], controller.addRoleGroupAdmin);
userRoleGroupRouter.get('/:id', [], controller.fetchUserRoleGroup);
userRoleGroupRouter.put(
  '/:roleGroupId',
  [userRoleGroupValidator.validateUpdateUserRoleGroup],
  controller.updateUserRoleGroup
);
userRoleGroupRouter.put(
  '/delete-admin/:adminContextId',
  controller.removeRoleGroupAdmin
);
userRoleGroupRouter.delete('/:roleGroupId', controller.deleteUserRoleGroup);

userRoleGroupRouter.delete(
  '/app/:roleGroupAppId',
  controller.deleteUserRoleGroupApp
);

module.exports = userRoleGroupRouter;
