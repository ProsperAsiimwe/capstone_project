const Joi = require('joi');

const createDocumentVerificationPolicySchema = Joi.object({
  enrollment_status_id: Joi.number().required(),
  is_active: Joi.boolean(),
});

const updateDocumentVerificationPolicySchema = Joi.object({
  enrollment_status_id: Joi.number(),
  is_active: Joi.boolean(),
});

module.exports = {
  createDocumentVerificationPolicySchema,
  updateDocumentVerificationPolicySchema,
};
