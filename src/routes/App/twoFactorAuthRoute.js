const Router = require('express').Router();
const { TwoFactorAuthenticationController } = require('@controllers/index');
const { twoFactorAuthValidator } = require('@validators/App');

const controller = new TwoFactorAuthenticationController();

Router.post(
  '/',
  [twoFactorAuthValidator.validateCreateTwoFactorAuthOTP],
  controller.createTwoFactorAuth
);

module.exports = Router;
