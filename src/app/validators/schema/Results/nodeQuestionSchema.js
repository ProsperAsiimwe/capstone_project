const Joi = require('joi');

const createNodeQuestionSchema = Joi.object({
  is_number_based: Joi.boolean().empty().default(false),
  is_alphabet_based: Joi.boolean().empty().default(false),
  is_roman_numeral_based: Joi.boolean().empty().default(false),
  questions_from: Joi.string(),
  questions_to: Joi.string(),
  is_custom_based: Joi.boolean().empty().default(false),
  custom_questions: Joi.array().items(Joi.string()),
});

module.exports = {
  createNodeQuestionSchema,
};
