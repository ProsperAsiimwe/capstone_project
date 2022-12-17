const express = require('express');
const {
  RegistrationPolicyController,
} = require('@controllers/InstitutionPolicy');
const {
  registrationPolicyValidator,
} = require('@validators/InstitutionPolicy');

const registrationPolicyRouter = express.Router();
const controller = new RegistrationPolicyController();

registrationPolicyRouter.get('/', controller.index);

registrationPolicyRouter.post(
  '/',
  [registrationPolicyValidator.validateCreateRegistrationPolicy],
  controller.createRegistrationPolicy
);

registrationPolicyRouter.put(
  '/:registrationPolicyId',
  [registrationPolicyValidator.validateUpdateRegistrationPolicy],
  controller.updateRecord
);
registrationPolicyRouter.delete('/:id', controller.deleteRecord);

module.exports = registrationPolicyRouter;
