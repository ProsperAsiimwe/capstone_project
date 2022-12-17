const Joi = require('joi');

const applicantSchema = Joi.object({
  surname: Joi.string().max(60).required(),
  other_names: Joi.string().max(60).required(),
  phone: Joi.string().required(),
  email: Joi.string().required(),
  gender: Joi.string().min(4).max(6).required(),
});

const institutionSchema = Joi.object({
  institution_type_id: Joi.number().required(),
  code: Joi.string().required(),
  name: Joi.string().required(),
  address: Joi.string(),
  district: Joi.string(),
  village: Joi.string(),
  county: Joi.string(),
  slogan: Joi.string(),
  website: Joi.string(),
  logo: Joi.string(),
  email: Joi.string(),
  telephone_1: Joi.string(),
  telephone_2: Joi.string(),
  academic_unit: Joi.string(),
});

const programmeSchema = Joi.object({
  institution_id: Joi.number().required(),
  duration_measure_id: Joi.number().required(),
  award_id: Joi.number().required(),
  programme_study_level_id: Joi.number().required(),
  programme_code: Joi.string().required(),
  programme_title: Joi.string().required(),
  programme_description: Joi.string(),
  academic_unit: Joi.string(),
  programme_duration: Joi.string(),
  admission_requirements: Joi.string(),
});

module.exports = {
  applicantSchema,
  institutionSchema,
  programmeSchema,
};
