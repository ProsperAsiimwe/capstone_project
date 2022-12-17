const Joi = require('joi');

const functionalFeesAmountFeesElement = Joi.object().keys({
  fees_element_id: Joi.number().required(),
  paid_when_id: Joi.number().required(),
  currency_id: Joi.number().required(),
  amount: Joi.number().required(),
});

const createFunctionalFeesAmountSchema = Joi.object({
  programme_study_level_id: Joi.number().required(),
  academic_years: Joi.array().items(Joi.number()).required(),
  campuses: Joi.array().items(Joi.number()).required(),
  intakes: Joi.array().items(Joi.number()).required(),
  billing_categories: Joi.array().items(Joi.number()).required(),
  programme_types: Joi.array().items(Joi.number()).required(),
  functionalFeesAmountFeesElements: Joi.array()
    .items(functionalFeesAmountFeesElement)
    .required(),
});

const updateFunctionalFeesAmountSchema = Joi.object({
  programme_study_level_id: Joi.number().required(),
  academic_year_id: Joi.number().required(),
  campus_id: Joi.number().required(),
  intake_id: Joi.number().required(),
  billing_category_id: Joi.number().required(),
  programme_type_id: Joi.number().required(),
  functionalFeesAmountFeesElements: Joi.array()
    .items(functionalFeesAmountFeesElement)
    .required(),
});

const approveAmountsSchema = Joi.object({
  requests: Joi.array().items(Joi.number()).required(),
  approval_comments: Joi.string(),
});

const addAmountElementsSchema = Joi.object({
  functionalFeesAmountFeesElements: Joi.array()
    .items(functionalFeesAmountFeesElement)
    .required(),
});

const updateFunctionalFeesAmountElementsSchema = Joi.object({
  fees_element_id: Joi.number(),
  currency_id: Joi.number(),
  paid_when_id: Joi.number(),
  amount: Joi.number().required(),
});

module.exports = {
  createFunctionalFeesAmountSchema,
  updateFunctionalFeesAmountSchema,
  approveAmountsSchema,
  addAmountElementsSchema,
  updateFunctionalFeesAmountElementsSchema,
};
