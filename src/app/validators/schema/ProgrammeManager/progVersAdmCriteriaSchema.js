const Joi = require('joi');

const createProgVersAdmCriteriaSchema = Joi.object({
  // programme_version_id Must be a number
  // programme_version_id is Required
  programme_version_id: Joi.number().required(),

  // study_level_id Must be a number
  // study_level_id is Required
  study_level_id: Joi.number().required(),

  // admission_criteria_category_id Must be a number
  // admission_criteria_category_id is Required
  admission_criteria_category_id: Joi.number().required(),

  // admission_criteria_condition_id Must be a number
  // admission_criteria_condition_id is Required
  admission_criteria_condition_id: Joi.number().required(),
});

module.exports = { createProgVersAdmCriteriaSchema };
