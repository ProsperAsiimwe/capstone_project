const Joi = require('joi');

const createTwoFactorAuthOTPSchema = Joi.object({
  operation: Joi.string().required(),
  area_accessed: Joi.string().required(),
});

const enterTwoFactorAuthOTPSchema = Joi.object({
  otp: Joi.number().required(),
});

module.exports = {
  enterTwoFactorAuthOTPSchema,
  createTwoFactorAuthOTPSchema,
};
