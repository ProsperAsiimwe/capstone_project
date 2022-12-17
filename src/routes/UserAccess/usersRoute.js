const express = require('express');
const { UserController } = require('@controllers/UserAccess');
const { userValidator } = require('@validators/UserAccess');
const { authValidator } = require('@validators/UserAccess');

const userRouter = express.Router();
const controller = new UserController();

userRouter.get('/', [], controller.index);
userRouter.post('/', [userValidator.validateCreateUser], controller.createUser);
userRouter.get('/user-app-functions', [], controller.findUserRoleAppFunctions);
userRouter.get('/departments', controller.getMyDepartments);
userRouter.get('/:id', [], controller.getOne);
userRouter.post(
  '/remove-roles/:userId',
  [userValidator.validateRemoveRoles],
  controller.removeRolesFromUser
);
userRouter.put(
  '/change-otp',
  [authValidator.validateChangeDefaultPassword],
  controller.changeDefaultPassword
);

userRouter.put(
  '/change-password',
  [authValidator.validateChangePassword],
  controller.changePassword
);

userRouter.put(
  '/activate-users',
  [userValidator.validateActivateUsers],
  controller.activateUser
);

userRouter.put(
  '/de-activate-users',
  [userValidator.validateDeActivateUsers],
  controller.deActivateUser
);
userRouter.put(
  '/:userId',
  [userValidator.validateUpdateUser],
  controller.updateUser
);

module.exports = userRouter;
