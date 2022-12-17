const Joi = require('joi');

const createChartOfAccountSchema = Joi.object({
  account_type_id: Joi.number().required(),
  account_status_id: Joi.number().required(),
  tax_id: Joi.number(),
  account_code: Joi.string().required(),
  account_name: Joi.string().required(),
});

const createAccountReceivableSchema = Joi.object({
  account_id: Joi.number().required(),
  currency_id: Joi.number().required(),
  receivable_name: Joi.string().required(),
  description: Joi.string(),
  unit_cost: Joi.number().required(),
  is_public: Joi.boolean(),
  is_active: Joi.boolean(),
});

const approveAccountReceivableSchema = Joi.object({
  approval_ids: Joi.array().items(Joi.number()).required(),
});

module.exports = {
  createChartOfAccountSchema,
  createAccountReceivableSchema,
  approveAccountReceivableSchema,
};
