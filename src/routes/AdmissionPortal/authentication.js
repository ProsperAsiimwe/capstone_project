const { Router } = require('express');
const { ApplicantAuthController } = require('@controllers/AdmissionPortal');
const { authValidator } = require('@validators/UserAccess');
const { applicantValidator } = require('@validators/Admissions');
const applicantLoginRequired = require('../../app/middleware/authRouteApplicant');

const controller = new ApplicantAuthController();
const authRouter = Router();

// Applicant Authentication API
authRouter.post(
  '/register',
  [applicantValidator.validateCreateApplicant],
  controller.createApplicant
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
