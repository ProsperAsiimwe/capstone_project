const Joi = require('joi');

const createGradingValueSchema = Joi.object({
  // Foreign key referencing gradings table
  grading_id: Joi.number().required(),

  // max_value Must be a number
  // max_value is Required
  max_value: Joi.number().required(),

  // min_value Must be a number
  // min_value is Required
  min_value: Joi.number().required(),

  // grading_point Must be a number
  // grading_point is Required
  grading_point: Joi.number().required(),

  // gradingValue_letter Must be a String
  // gradingValue_letter is Required
  grading_letter: Joi.string().required().max(5),

  // interpretation Must be a String
  // interpretation is not Required
  interpretation: Joi.string(),
});

module.exports = { createGradingValueSchema };
