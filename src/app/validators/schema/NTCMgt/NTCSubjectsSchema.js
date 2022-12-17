const Joi = require('joi');

const createNTCSubjectSchema = Joi.object({
  ntc_subject_category_id: Joi.number().required(),
  ntc_subject_code: Joi.string().required(),
  ntc_subject_title: Joi.string().required(),
});

module.exports = { createNTCSubjectSchema };
