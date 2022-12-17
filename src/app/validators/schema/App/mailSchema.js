const Joi = require('joi');

const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required().trim().max(100),
});

module.exports = resendVerificationSchema;
