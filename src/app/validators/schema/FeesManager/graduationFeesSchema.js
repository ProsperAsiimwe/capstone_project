const Joi = require('joi');

const graduationFeesAmountElements = Joi.object().keys({
  fees_element_id: Joi.number().required(),
  currency_id: Joi.number().required(),
  amount: Joi.number().required(),
});

const createGraduationFeesSchema = Joi.object({
  grad_academic_years: Joi.array().items(Joi.number()).required(),
  campuses: Joi.array().items(Joi.number()).required(),
  billing_categories: Joi.array().items(Joi.number()).required(),
  study_levels: Joi.array().items(Joi.number()).required(),
  graduationFeesAmountElements: Joi.array()
    .items(graduationFeesAmountElements)
    .required(),
});

const updateGraduationFeesSchema = Joi.object({
  grad_academic_year_id: Joi.number().required(),
  campus_id: Joi.number().required(),
  billing_category_id: Joi.number().required(),
  programme_study_level_id: Joi.number().required(),
});

const addGraduationFeesElementsSchema = Joi.object({
  graduationFeesAmountElements: Joi.array()
    .items(graduationFeesAmountElements)
    .required(),
});

const updateGraduationFeesElementsSchema = Joi.object({
  fees_element_id: Joi.number(),
  currency_id: Joi.number(),
  amount: Joi.number().required(),
});

const approveAmountsSchema = Joi.object({
  requests: Joi.array().items(Joi.number()).required(),
});

module.exports = {
  createGraduationFeesSchema,
  updateGraduationFeesSchema,
  approveAmountsSchema,
  addGraduationFeesElementsSchema,
  updateGraduationFeesElementsSchema,
};
