const express = require('express');
const {
  EnrollmentAndRegistrationHistoryPolicyController,
} = require('@controllers/InstitutionPolicy');
const {
  enrollmentAndRegistrationHistoryPolicyValidator,
} = require('@validators/InstitutionPolicy');

const enrollmentAndRegistrationHistoryPolicyRouter = express.Router();
const controller = new EnrollmentAndRegistrationHistoryPolicyController();

enrollmentAndRegistrationHistoryPolicyRouter.get('/', controller.index);

enrollmentAndRegistrationHistoryPolicyRouter.post(
  '/',
  [
    enrollmentAndRegistrationHistoryPolicyValidator.validateCreateEnrollmentAndRegistrationHistoryPolicy,
  ],
  controller.createRecord
);

enrollmentAndRegistrationHistoryPolicyRouter.put(
  '/update/:id',
  [
    enrollmentAndRegistrationHistoryPolicyValidator.validateUpdateEnrollmentAndRegistrationHistoryPolicy,
  ],
  controller.updateRecord
);

enrollmentAndRegistrationHistoryPolicyRouter.delete(
  '/:id',
  controller.deleteRecord
);

module.exports = enrollmentAndRegistrationHistoryPolicyRouter;
