const Joi = require('joi');
const appFunction = Joi.object().keys({
  function_name: Joi.string().required().max(60),
  function_description: Joi.string(),
});

const createAppSchema = Joi.object({
  app_code: Joi.string().required().max(30),
  app_name: Joi.string().required().max(60),
  app_url: Joi.string(),
  app_icon: Joi.string(),
  app_status: Joi.boolean().required().default(true),
  app_description: Joi.string().required(),
  // Get list of app functions.
  app_functions: Joi.array().required().items(appFunction),
});
// update appschema
const updateAppSchema = Joi.object({
  app_code: Joi.string().required().max(30),
  app_name: Joi.string().required().max(60),
  app_url: Joi.string(),
  app_icon: Joi.string(),
  app_status: Joi.boolean().required().default(true),
  app_description: Joi.string().required(),
  // Get list of app functions.
  app_functions: Joi.array().required().items(appFunction),
});

// export the modules
module.exports = { createAppSchema, updateAppSchema };
