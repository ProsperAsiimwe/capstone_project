const Joi = require('joi');

const createApplicantNextOfKinSchema = Joi.object({
  running_admission_id: Joi.number().required(),
  section_id: Joi.number().required(),
  form_id: Joi.string(),
  next_of_kin_name: Joi.string().required(),
  next_of_kin_relationship: Joi.string().required(),
  next_of_kin_phone: Joi.string().required(),
  next_of_kin_address: Joi.string().required(),
  next_of_kin_email: Joi.string(),
});

const updateApplicantNextOfKinSchema = Joi.object({
  running_admission_id: Joi.number(),
  section_id: Joi.number(),
  form_id: Joi.string(),
  next_of_kin_name: Joi.string(),
  next_of_kin_relationship: Joi.string(),
  next_of_kin_phone: Joi.string(),
  next_of_kin_address: Joi.string(),
  next_of_kin_email: Joi.string(),
});

module.exports = {
  createApplicantNextOfKinSchema,
  updateApplicantNextOfKinSchema,
};
