const { Router } = require('express');
const { UserController } = require('@controllers/index');
const { authValidator } = require('@validators/UserAccess');
const loginRequired = require('@middleware/authRoute');

const controller = new UserController();
const authRouter = Router();

// User Authentication API
authRouter.post('/login', [authValidator.validateLogin], controller.login);
authRouter.post(
  '/forgot-password/send-otp',
  [authValidator.validateRequestOTP],
  controller.sendForgotPasswordOTP
);
authRouter.post(
  '/forgot-password/verify-otp',
  [authValidator.validateResetPassword],
  controller.verifyForgotPasswordOTP
);
authRouter.post('/logout', [loginRequired], controller.logout);
authRouter.get('/profile', [loginRequired], controller.getAuthUserProfile);
authRouter.post(
  '/user-search',
  [loginRequired, authValidator.validateSearchUser],
  controller.getAuthUserSearch
);

module.exports = authRouter;
