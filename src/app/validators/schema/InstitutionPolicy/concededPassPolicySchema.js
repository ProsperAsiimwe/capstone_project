const Joi = require('joi');

const createConcededPassPolicySchema = Joi.object({
  grading_id: Joi.number().required(),
  lower_mark: Joi.number().min(0).max(100).required(),
  upper_mark: Joi.number().min(0).max(100).required(),
  remark_id: Joi.number().required(),
  number_of_sittings: Joi.number().required(),
  maximum_number_of_cps: Joi.number().min(0).max(5),
});

const updateConcededPassPolicySchema = Joi.object({
  grading_id: Joi.number().required(),
  lower_mark: Joi.number().min(0).max(100).required(),
  upper_mark: Joi.number().min(0).max(100).required(),
  remark_id: Joi.number().required(),
  number_of_sittings: Joi.number().required(),
  maximum_number_of_cps: Joi.number().min(0).max(5),
});

module.exports = {
  createConcededPassPolicySchema,
  updateConcededPassPolicySchema,
};
