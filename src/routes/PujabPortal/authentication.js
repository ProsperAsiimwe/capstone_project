const { Router } = require('express');
const { authValidator } = require('@validators/UserAccess');
const { pujabValidator } = require('@validators/Pujab');
const applicantLoginRequired = require('../../app/middleware/authRoutePujabApplicant');
const { PujabApplicantAuthController } = require('@controllers/PujabPortal');

const controller = new PujabApplicantAuthController();
const authRouter = Router();

// Applicant Authentication API
authRouter.post(
  '/register',
  [pujabValidator.validateCreateApplicant],
  controller.createPujabApplicant
);
authRouter.post('/login', [authValidator.validateLogin], controller.login);
authRouter.post('/logout', [applicantLoginRequired], controller.logout);
authRouter.get(
  '/profile',
  [applicantLoginRequired],
  controller.getAuthApplicantProfile
);

authRouter.get(
  '/active-payment-references',
  [applicantLoginRequired],
  controller.getActiveApplicantPaymentReferences
);

authRouter.put(
  '/change-password',
  [applicantLoginRequired],
  [authValidator.validateChangePassword],
  controller.changeApplicantPassword
);

authRouter.put(
  '/change-default-password',
  [applicantLoginRequired],
  [authValidator.validateChangeDefaultPassword],
  controller.changeApplicantDefaultPassword
);
authRouter.post(
  '/request-token',
  [authValidator.validateRequestOTP],
  controller.requestOneTimePasswordToken
);
authRouter.put(
  '/reset-password',
  [authValidator.validateResetPassword],
  controller.resetApplicantPassword
);

module.exports = authRouter;
