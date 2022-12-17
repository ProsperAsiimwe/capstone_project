const Joi = require('joi');

const createRetakersFeesPolicySchema = Joi.object({
  enrollment_status_id: Joi.number().required(),
  study_level_id: Joi.number().required(),
  functional_fees_elements: Joi.array().required(),
  use_default_amount: Joi.boolean().required(),
  bill_functional_fees: Joi.boolean().required(),
  amount: Joi.number(),
});

const addNewRetakersFeesPolicyElementsSchema = Joi.object({
  functional_fees_elements: Joi.array().required(),
});

const deleteRetakersFeesPolicyElementsSchema = Joi.object({
  functional_fees_elements: Joi.array().required(),
});

const updateRetakersFeesPolicySchema = Joi.object({
  enrollment_status_id: Joi.number().required(),
  study_level_id: Joi.number().required(),
  functional_fees_elements: Joi.array().required(),
  use_default_amount: Joi.boolean().required(),
  bill_functional_fees: Joi.boolean().required(),
  amount: Joi.number().optional(),
});

module.exports = {
  createRetakersFeesPolicySchema,
  updateRetakersFeesPolicySchema,
  addNewRetakersFeesPolicyElementsSchema,
  deleteRetakersFeesPolicyElementsSchema,
};
