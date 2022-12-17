const Joi = require('joi');

const createRegistrationPolicySchema = Joi.object({
  registration_type_id: Joi.number().required(),
  is_combined: Joi.boolean(),
  tuition_fee_percentage: Joi.number(),
  functional_fee_percentage: Joi.number(),
  combined_fee_percentage: Joi.number(),
  enrollment_statuses: Joi.array().required(),
});

const updateRegistrationPolicySchema = Joi.object({
  enrollment_status_id: Joi.number().required(),
  registration_type_id: Joi.number().required(),
  is_combined: Joi.boolean(),
  tuition_fee_percentage: Joi.number(),
  functional_fee_percentage: Joi.number(),
  combined_fee_percentage: Joi.number(),
});

module.exports = {
  createRegistrationPolicySchema,
  updateRegistrationPolicySchema,
};
