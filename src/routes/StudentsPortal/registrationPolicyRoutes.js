const express = require('express');
const {
  RegistrationPolicyController,
} = require('@controllers/InstitutionPolicy');

const registrationPolicyRouter = express.Router();
const controller = new RegistrationPolicyController();

registrationPolicyRouter.get('/', controller.index);

module.exports = registrationPolicyRouter;
