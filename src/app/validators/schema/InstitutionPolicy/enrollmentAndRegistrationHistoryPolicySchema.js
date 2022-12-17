const Joi = require('joi');

const createEnrollmentAndRegistrationHistoryPolicySchema = Joi.object({
  enrollment_status_id: Joi.number().required(),
  is_active: Joi.boolean(),
});

const updateEnrollmentAndRegistrationHistoryPolicySchema = Joi.object({
  enrollment_status_id: Joi.number(),
  is_active: Joi.boolean(),
});

module.exports = {
  createEnrollmentAndRegistrationHistoryPolicySchema,
  updateEnrollmentAndRegistrationHistoryPolicySchema,
};
