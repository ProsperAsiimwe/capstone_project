const Joi = require('joi');

const otherFeesAmountFeesElement = Joi.object().keys({
  fees_element_id: Joi.number().required(),
  currency_id: Joi.number().required(),
  amount: Joi.number().required(),
});

const createOtherFeesAmountSchema = Joi.object({
  academic_years: Joi.array().items(Joi.number()).required(),
  campuses: Joi.array().items(Joi.number()).required(),
  intakes: Joi.array().items(Joi.number()).required(),
  billing_categories: Joi.array().items(Joi.number()).required(),
  otherFeesAmountFeesElements: Joi.array()
    .items(otherFeesAmountFeesElement)
    .required(),
});

const updateOtherFeesAmountSchema = Joi.object({
  academic_year_id: Joi.number().required(),
  campus_id: Joi.number().required(),
  intake_id: Joi.number().required(),
  billing_category_id: Joi.number().required(),
});

const approveAmountsSchema = Joi.object({
  requests: Joi.array().items(Joi.number()).required(),
  approval_comments: Joi.string(),
});

const addAmountElementsSchema = Joi.object({
  otherFeesAmountFeesElements: Joi.array()
    .items(otherFeesAmountFeesElement)
    .required(),
});

const updateOtherFeesAmountElementsSchema = Joi.object({
  fees_element_id: Joi.number(),
  currency_id: Joi.number(),
  amount: Joi.number().required(),
});

module.exports = {
  createOtherFeesAmountSchema,
  updateOtherFeesAmountSchema,
  approveAmountsSchema,
  addAmountElementsSchema,
  updateOtherFeesAmountElementsSchema,
};
