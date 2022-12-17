const Joi = require('joi');

const createFeesElementSchema = Joi.object({
  fees_category_id: Joi.number().required(),

  account_id: Joi.number().required(),

  fees_element_code: Joi.string().required(),

  fees_element_name: Joi.string().required(),

  description: Joi.string().required(),
});

const updateFeesElementSchema = Joi.object({
  fees_category_id: Joi.number().required(),

  account_id: Joi.number().required(),

  fees_element_code: Joi.string().required(),

  fees_element_name: Joi.string().required(),

  description: Joi.string().required(),
});

module.exports = { createFeesElementSchema, updateFeesElementSchema };
