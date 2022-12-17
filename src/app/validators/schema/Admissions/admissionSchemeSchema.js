const Joi = require('joi');

const createAdmissionSchemeSchema = Joi.object({
  scheme_name: Joi.string().required(),
  scheme_description: Joi.string().required(),
});

const updateAdmissionSchemeSchema = Joi.object({
  scheme_name: Joi.string(),
  scheme_description: Joi.string(),
});

module.exports = { createAdmissionSchemeSchema, updateAdmissionSchemeSchema };
