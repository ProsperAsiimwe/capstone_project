const Joi = require('joi');

const billingCategoryAmounts = Joi.object().keys({
  billing_category_id: Joi.number().required(),
  currency_id: Joi.number().required(),
  amount: Joi.number().required(),
});

const createStudentServicePolicySchema = Joi.object({
  account_id: Joi.number().required(),
  student_service_type_id: Joi.number().required(),
  amounts: Joi.array().items(billingCategoryAmounts).required(),
});

const updateStudentServicePolicySchema = Joi.object({
  account_id: Joi.number().required(),
  student_service_type_id: Joi.number().required(),
  amounts: Joi.array().items(billingCategoryAmounts),
});

module.exports = {
  createStudentServicePolicySchema,
  updateStudentServicePolicySchema,
};
