const Joi = require('joi');
const gradingValue = Joi.object().keys({
  max_value: Joi.number().required(),
  min_value: Joi.number().required(),
  grading_point: Joi.number().required(),
  grading_letter: Joi.string().required().max(5),
  interpretation: Joi.string(),
});

const createGradingSchema = Joi.object({
  grading_code: Joi.string().required().max(100),
  grading_description: Joi.string(),
  values: Joi.array().items(gradingValue),
});

module.exports = { createGradingSchema };
