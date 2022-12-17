const Joi = require('joi');

const createApplicantEmploymentRecordSchema = Joi.object({
  running_admission_id: Joi.number().required(),
  section_id: Joi.number().required(),
  form_id: Joi.string(),
  employer: Joi.string().required(),
  post_held: Joi.string().required(),
  employment_start_date: Joi.date().required(),
  employment_end_date: Joi.date(),
});

const updateApplicantEmploymentRecordSchema = Joi.object({
  running_admission_id: Joi.number(),
  section_id: Joi.number(),
  form_id: Joi.string(),
  employer: Joi.string().required(),
  post_held: Joi.string().required(),
  employment_start_date: Joi.date().required(),
  employment_end_date: Joi.date(),
});

module.exports = {
  createApplicantEmploymentRecordSchema,
  updateApplicantEmploymentRecordSchema,
};
