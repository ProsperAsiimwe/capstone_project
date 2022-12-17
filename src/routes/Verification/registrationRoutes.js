const { VerificationController } = require('@controllers/Verification');
const express = require('express');

const registrationRouter = express.Router();
const controller = new VerificationController();

registrationRouter.get('/', controller.verifyStudent);

module.exports = registrationRouter;
