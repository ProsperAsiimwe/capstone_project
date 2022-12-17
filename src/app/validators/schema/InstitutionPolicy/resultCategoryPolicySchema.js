const Joi = require('joi');

const policyData = Joi.object().keys({
  name: Joi.string().required(),
  range_from: Joi.number().required(),
  range_to: Joi.number().required(),
});

const createResultCategoryPolicySchema = Joi.object({
  programme_study_level_id: Joi.number().required(),
  policies: Joi.array().items(policyData).required(),
});

const updateResultCategoryPolicyItemSchema = Joi.object({
  name: Joi.string().required(),
  range_from: Joi.number().required(),
  range_to: Joi.number().required(),
});

module.exports = {
  createResultCategoryPolicySchema,
  updateResultCategoryPolicyItemSchema,
};
