const Joi = require('joi');

const billingCategoryAmounts = Joi.object().keys({
  billing_category_id: Joi.number().required(),
  currency_id: Joi.number().required(),
  amount: Joi.number().required(),
});

const createApplicationFeesPolicySchema = Joi.object({
  account_id: Joi.number().required(),
  policy_name: Joi.string().required(),
  amounts: Joi.array().items(billingCategoryAmounts).required(),
});

const updateApplicationFeesPolicySchema = Joi.object({
  account_id: Joi.number().required(),
  policy_name: Joi.string().required(),
  amounts: Joi.array().items(billingCategoryAmounts),
});

const createAdmissionFeesPolicySchema = Joi.object({
  account_id: Joi.number().required(),
  policy_name: Joi.string().required(),
  amounts: Joi.array().items(billingCategoryAmounts).required(),
});

const updateAdmissionFeesPolicySchema = Joi.object({
  account_id: Joi.number().required(),
  policy_name: Joi.string().required(),
  amounts: Joi.array().items(billingCategoryAmounts),
});

module.exports = {
  createApplicationFeesPolicySchema,
  createAdmissionFeesPolicySchema,
  updateApplicationFeesPolicySchema,
  updateAdmissionFeesPolicySchema,
};
