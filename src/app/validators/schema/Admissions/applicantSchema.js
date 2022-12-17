const Joi = require('joi');

const createApplicantSchema = Joi.object({
  surname: Joi.string().required().trim().max(60),

  other_names: Joi.string().required().trim().max(60),

  email: Joi.string().email().required().trim().max(60),

  phone: Joi.string().required().trim().max(30),

  gender: Joi.string().required().max(20),

  avatar: Joi.string(),
});

const updateApplicantSchema = Joi.object({
  surname: Joi.string().trim().max(60),

  other_names: Joi.string().trim().max(60),

  email: Joi.string().email().trim().max(60),

  phone: Joi.string().trim().max(30),

  gender: Joi.string().max(20),

  avatar: Joi.string(),
});

module.exports = { createApplicantSchema, updateApplicantSchema };
