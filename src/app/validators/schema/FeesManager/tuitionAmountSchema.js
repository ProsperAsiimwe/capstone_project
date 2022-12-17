const Joi = require('joi');

const tuitionAmountFeesElement = Joi.object().keys({
  fees_element_id: Joi.number().required(),
  paid_when_id: Joi.number().required(),
  currency_id: Joi.number().required(),
  amount: Joi.number().required(),
});

const createTuitionAmountSchema = Joi.object({
  programme_id: Joi.number().required(),
  academic_years: Joi.array().items(Joi.number()).required(),
  campuses: Joi.array().items(Joi.number()).required(),
  intakes: Joi.array().items(Joi.number()).required(),
  billing_categories: Joi.array().items(Joi.number()).required(),
  programme_types: Joi.array().items(Joi.number()).required(),
  study_years: Joi.array().items(Joi.number()).required(),
  tuitionAmountFeesElements: Joi.array()
    .items(tuitionAmountFeesElement)
    .required(),
});

const updateTuitionAmountSchema = Joi.object({
  academic_year_id: Joi.number().required(),
  campus_id: Joi.number().required(),
  intake_id: Joi.number().required(),
  billing_category_id: Joi.number().required(),
  programme_id: Joi.number().required(),
  programme_type_id: Joi.number().required(),
  study_year_id: Joi.number().required(),
});

const addTuitionAmountElementsSchema = Joi.object({
  tuitionAmountFeesElements: Joi.array()
    .items(tuitionAmountFeesElement)
    .required(),
});

const updateTuitionAmountElementsSchema = Joi.object({
  fees_element_id: Joi.number(),
  paid_when_id: Joi.number(),
  currency_id: Joi.number(),
  amount: Joi.number().required(),
});

const approveAmountsSchema = Joi.object({
  requests: Joi.array().items(Joi.number()).required(),
  approval_comments: Joi.string(),
});

module.exports = {
  createTuitionAmountSchema,
  updateTuitionAmountSchema,
  approveAmountsSchema,
  addTuitionAmountElementsSchema,
  updateTuitionAmountElementsSchema,
};
