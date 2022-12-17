const Joi = require('joi');

const createApplicantRefereeDetailSchema = Joi.object({
  running_admission_id: Joi.number().required(),
  section_id: Joi.number().required(),
  form_id: Joi.string(),
  referee_name: Joi.string().required(),
  referee_email: Joi.string(),
  referee_phone: Joi.string(),
  referee_address: Joi.string().required(),
});

const updateApplicantRefereeDetailSchema = Joi.object({
  running_admission_id: Joi.number(),
  section_id: Joi.number(),
  form_id: Joi.string(),
  referee_name: Joi.string().required(),
  referee_email: Joi.string(),
  referee_phone: Joi.string(),
  referee_address: Joi.string().required(),
});

module.exports = {
  createApplicantRefereeDetailSchema,
  updateApplicantRefereeDetailSchema,
};
