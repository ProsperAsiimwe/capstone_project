const express = require('express');
const { MailController } = require('@controllers/MailManager');
const { mail } = require('@validators/App');

const MailRoute = express.Router();
const controller = new MailController();

MailRoute.post(
  '/resend-verification-link',
  [mail.validateResendVerificationLink],
  controller.requestVerificationEmail
);
MailRoute.post('/verify/:token', [], controller.verifyEmail);

module.exports = MailRoute;
