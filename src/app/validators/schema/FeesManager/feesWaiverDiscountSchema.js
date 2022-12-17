const Joi = require('joi');

const feesWaiverDiscountFeesElement = Joi.object().keys({
  fees_element_id: Joi.number().required(),
  percentage_discount: Joi.number().required(),
});

const createFeesWaiverDiscountSchema = Joi.object({
  fees_waiver_id: Joi.number().required(),
  academic_years: Joi.array().items(Joi.number()).required(),
  campuses: Joi.array().items(Joi.number()).required(),
  intakes: Joi.array().items(Joi.number()).required(),
  discountedElements: Joi.array()
    .items(feesWaiverDiscountFeesElement)
    .required(),
});

const updateFeesWaiverDiscountSchema = Joi.object({
  fees_waiver_id: Joi.number().required(),
  academic_year_id: Joi.number().required(),
  campus_id: Joi.number().required(),
  intake_id: Joi.number().required(),
  discountedElements: Joi.array()
    .items(feesWaiverDiscountFeesElement)
    .required(),
});

const approveAmountsSchema = Joi.object({
  requests: Joi.array().items(Joi.number()).required(),
  approval_comments: Joi.string(),
});

const addAmountElementsSchema = Joi.object({
  discountedElements: Joi.array()
    .items(feesWaiverDiscountFeesElement)
    .required(),
});

const updateFeesWaiverDiscountedElementSchema = Joi.object({
  fees_element_id: Joi.number(),
  percentage_discount: Joi.number().required(),
});

module.exports = {
  createFeesWaiverDiscountSchema,
  updateFeesWaiverDiscountSchema,
  approveAmountsSchema,
  addAmountElementsSchema,
  updateFeesWaiverDiscountedElementSchema,
};
