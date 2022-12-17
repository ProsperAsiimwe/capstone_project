const Joi = require('joi');

const createSecurityProfileSchema = Joi.object({
  // security_profile_name Must be a String
  // security_profile_name is Required
  security_profile_name: Joi.string().required().max(60),

  // password_change_frequency_days Must be a number
  // password_change_frequency_days is Required
  password_change_frequency_days: Joi.number(),

  // min_password_length Must be a number
  // min_password_length is Required
  min_password_length: Joi.number(),

  // session_timeout_mins Must be a number
  // session_timeout_mins is Required
  session_timeout_mins: Joi.number(),

  // has_two_factor_authentication Must be a bool
  // has_two_factor_authentication is Required
  has_two_factor_authentication: Joi.boolean(),

  // min_no_password_digits Must be a number
  // min_no_password_digits is Required
  min_no_password_digits: Joi.number(),

  // min_no_special_characters Must be a number
  // min_no_special_characters is Required
  min_no_special_characters: Joi.number(),

  // min_no_uppercase Must be a number
  // min_no_uppercase is Required
  min_no_uppercase_characters: Joi.number(),
});

const updateSecurityProfileSchema = Joi.object({
  // security_profile_name Must be a String
  // security_profile_name is Required
  security_profile_name: Joi.string().required().max(60),

  // password_change_frequency_days Must be a number
  // password_change_frequency_days is Required
  password_change_frequency_days: Joi.number(),

  // min_password_length Must be a number
  // min_password_length is Required
  min_password_length: Joi.number(),

  // session_timeout_mins Must be a number
  // session_timeout_mins is Required
  session_timeout_mins: Joi.number(),

  // has_two_factor_authentication Must be a bool
  // has_two_factor_authentication is Required
  has_two_factor_authentication: Joi.boolean(),

  // min_no_password_digits Must be a number
  // min_no_password_digits is Required
  min_no_password_digits: Joi.number(),

  // min_no_special_characters Must be a number
  // min_no_special_characters is Required
  min_no_special_characters: Joi.number(),

  // min_no_uppercase Must be a number
  // min_no_uppercase is Required
  min_no_uppercase_characters: Joi.number(),
});

module.exports = { createSecurityProfileSchema, updateSecurityProfileSchema };
