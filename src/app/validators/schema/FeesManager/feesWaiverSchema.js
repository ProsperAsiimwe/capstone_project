const Joi = require('joi');

const createFeesWaiverSchema = Joi.object({
  fees_waiver_code: Joi.string().required(),

  fees_waiver_name: Joi.string().required(),

  description: Joi.string().required(),
});

const updateFeesWaiverSchema = Joi.object({
  fees_waiver_code: Joi.string().required(),

  fees_waiver_name: Joi.string().required(),

  description: Joi.string().required(),
});

module.exports = { createFeesWaiverSchema, updateFeesWaiverSchema };
