const Joi = require('joi');

const createGraduateFeesPolicySchema = Joi.object({
  enrollment_status_id: Joi.number().required(),
  study_level_id: Joi.number().required(),
  functional_fees_elements: Joi.array().required(),
  use_default_amount: Joi.boolean().required(),
  bill_functional_fees: Joi.boolean().required(),
  amount: Joi.number(),
});

const addNewGraduateFeesPolicyElementsSchema = Joi.object({
  functional_fees_elements: Joi.array().required(),
});

const deleteGraduateFeesPolicyElementsSchema = Joi.object({
  functional_fees_elements: Joi.array().required(),
});

const updateGraduateFeesPolicySchema = Joi.object({
  enrollment_status_id: Joi.number().required(),
  study_level_id: Joi.number().required(),
  functional_fees_elements: Joi.array().required(),
  use_default_amount: Joi.boolean().required(),
  bill_functional_fees: Joi.boolean().required(),
  amount: Joi.number().optional(),
});

module.exports = {
  createGraduateFeesPolicySchema,
  updateGraduateFeesPolicySchema,
  addNewGraduateFeesPolicyElementsSchema,
  deleteGraduateFeesPolicyElementsSchema,
};
