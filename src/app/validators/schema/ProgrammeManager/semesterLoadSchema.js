const Joi = require('joi');

const createSemesterLoadSchema = Joi.object({
  // programme_study_level_id Must be a number
  programme_study_level_id: Joi.number().required(),

  programme_id: Joi.number(),

  // normal_minimum_load Must be a number
  normal_minimum_load: Joi.number().required(),

  // normal_maximum_load Must be a number
  normal_maximum_load: Joi.number().required(),

  // overall_maximum_load Must be a number
  overall_maximum_load: Joi.number().required(),

  is_programme_based: Joi.boolean(),
});
const updateSemesterLoadSchema = Joi.object({
  programme_study_level_id: Joi.number(),

  programme_id: Joi.number(),

  // normal_minimum_load Must be a number
  normal_minimum_load: Joi.number(),

  // normal_maximum_load Must be a number
  normal_maximum_load: Joi.number(),

  // overall_maximum_load Must be a number
  overall_maximum_load: Joi.number(),

  is_programme_based: Joi.boolean(),
});

module.exports = { createSemesterLoadSchema, updateSemesterLoadSchema };
