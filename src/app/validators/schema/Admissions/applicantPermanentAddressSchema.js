const Joi = require('joi');

const createApplicantPermanentAddressSchema = Joi.object({
  running_admission_id: Joi.number().required(),
  section_id: Joi.number().required(),
  form_id: Joi.string(),
  village: Joi.string(),
  sub_county: Joi.string(),
  district: Joi.string(),
});

const updateApplicantPermanentAddressSchema = Joi.object({
  running_admission_id: Joi.number(),
  section_id: Joi.number(),
  form_id: Joi.string(),
  village: Joi.string(),
  sub_county: Joi.string(),
  district: Joi.string(),
});

module.exports = {
  createApplicantPermanentAddressSchema,
  updateApplicantPermanentAddressSchema,
};
