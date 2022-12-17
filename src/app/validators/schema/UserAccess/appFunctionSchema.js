const Joi = require('joi');

const createAppFunctionSchema = Joi.object({
  app_id: Joi.number().required(),
  action_group: Joi.string().required().max(60),
  function_name: Joi.string().required().max(60),
  function_description: Joi.string().required(),
});
// update appschema
const updateAppFunctionSchema = Joi.object({
  action_group: Joi.string().required().max(60),
  function_name: Joi.string().required().max(60),
  function_description: Joi.string().required(),
});

// export the modules
module.exports = { createAppFunctionSchema, updateAppFunctionSchema };
