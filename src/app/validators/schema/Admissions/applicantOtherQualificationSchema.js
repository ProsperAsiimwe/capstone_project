const Joi = require('joi');

const createApplicantOtherQualificationSchema = Joi.object({
  running_admission_id: Joi.number().required(),
  section_id: Joi.number().required(),
  form_id: Joi.string(),
  institution_name: Joi.string(),
  award_obtained: Joi.string(),
  award_start_date: Joi.date(),
  award_end_date: Joi.date(),
  awarding_body: Joi.string(),
  grade_obtained: Joi.string(),
  interpretation: Joi.number(),
  award_type: Joi.string(),
  award_duration: Joi.string(),
  award_classification: Joi.string(),
  qualification_attachment: Joi.string(),
  does_not_have_qualification: Joi.boolean(),
});

const updateApplicantOtherQualificationSchema = Joi.object({
  running_admission_id: Joi.number(),
  section_id: Joi.number(),
  form_id: Joi.string(),
  institution_name: Joi.string(),
  award_obtained: Joi.string(),
  award_start_date: Joi.date(),
  award_end_date: Joi.date(),
  awarding_body: Joi.string(),
  grade_obtained: Joi.string(),
  interpretation: Joi.number(),
  award_type: Joi.string(),
  award_duration: Joi.string(),
  award_classification: Joi.string(),
  qualification_attachment: Joi.string(),
  does_not_have_qualification: Joi.boolean(),
});

module.exports = {
  createApplicantOtherQualificationSchema,
  updateApplicantOtherQualificationSchema,
};
