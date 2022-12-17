const Joi = require('joi');

const createUnebSubjectSchema = Joi.object({
  uneb_study_level_id: Joi.number().required(),
  uneb_subject_category_id: Joi.number(),
  general_subject_category_id: Joi.number().required(),
  uneb_subject_code: Joi.string().required(),
  uneb_subject_title: Joi.string().required(),
  papers: Joi.array(),
});

module.exports = { createUnebSubjectSchema };
