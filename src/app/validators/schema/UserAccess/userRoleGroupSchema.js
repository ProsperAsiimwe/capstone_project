const Joi = require('joi');

const userRoleGroupApp = Joi.number();
const userRoleGroupAdmin = Joi.number();

const createUserRoleGroupSchema = Joi.object({
  // userRoleGroup_code Must be a String
  // Trim White spacing
  // Maximum of 100 characters
  role_group_title: Joi.string().required().max(100),

  // security_profile_name Must be a String
  // security_profile_name is Required
  role_group_description: Joi.string().required(),

  // Get an array of apps from apps table
  user_role_group_apps: Joi.array().required().items(userRoleGroupApp),

  group_admins: Joi.array().required().items(userRoleGroupAdmin),
});

const adminsPayload = Joi.object().keys({
  user_id: Joi.number().required(),
  admin_type: Joi.string().required(),
});

const updateUserRoleGroupSchema = Joi.object({
  // userRoleGroup_code Must be a String
  // Trim White spacing
  // Maximum of 100 characters
  role_group_title: Joi.string().required().max(100),

  // security_profile_name Must be a String
  // security_profile_name is Required
  role_group_description: Joi.string().required(),

  // Get an array of apps from apps table
  user_role_group_apps: Joi.array().items(userRoleGroupApp),

  group_admins: Joi.array().items(adminsPayload),
});

module.exports = { createUserRoleGroupSchema, updateUserRoleGroupSchema };
