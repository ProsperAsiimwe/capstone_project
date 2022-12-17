const Joi = require('joi');

const userRoleApp = Joi.object().keys({
  application_id: Joi.number().required(),
  app_functions: Joi.array().required().items(Joi.number()),
});

const roleUserRoleGroupApps = Joi.object().keys({
  role_user_role_group_app_id: Joi.number().required(),
  function_id: Joi.number().required(),
});

const createRoleSchema = Joi.object({
  user_role_group_id: Joi.number().required(),

  security_profile_id: Joi.number().required(),

  role_code: Joi.string().required().trim().max(30),

  role_title: Joi.string().required().max(60),

  role_description: Joi.string(),

  max_number_users: Joi.number().required(),

  is_active: Joi.boolean(),

  bound_levels: Joi.array().items(Joi.number()).required(),
});

const updateRoleSchema = Joi.object({
  user_role_group_id: Joi.number().required(),
  security_profile_id: Joi.number(),
  role_code: Joi.string().required().trim().max(30),
  role_title: Joi.string().required().max(60),
  role_description: Joi.string(),
  max_number_users: Joi.number(),
  is_active: Joi.boolean(),
  bound_levels: Joi.array().items(Joi.number()),
});

const addRoleAppsWithFunctionSchema = Joi.object({
  applications: Joi.array().items(userRoleApp).required(),
});

const addUserRolesSchema = Joi.object({
  main_role: Joi.number().integer(),
  other_roles: Joi.array().items(Joi.number()),
});

const assignRoleToUser = Joi.object({
  user_id: Joi.number().required(),
  is_main_role: Joi.boolean().required(),
  access_all_campuses: Joi.boolean().required(),
  access_all_programmes: Joi.boolean().required(),
  access_all_colleges: Joi.boolean(),
  access_all_faculties: Joi.boolean(),
  access_all_departments: Joi.boolean(),
  campuses: Joi.array().items(Joi.number()),
  programmes: Joi.array().items(Joi.number()),
  colleges: Joi.array().items(Joi.number()),
  faculties: Joi.array().items(Joi.number()),
  departments: Joi.array().items(Joi.number()),
});

const removeRoleAppFunctionsSchema = Joi.object({
  // role_id: Joi.number().required(),
  // role_group_app_id: Joi.number().required(),
  app_function_ids: Joi.array().items(roleUserRoleGroupApps).required(),
});

const removeRoleUserRoleGroupAppsSchema = Joi.object({
  role_user_role_group_apps: Joi.array().items(Joi.number()).required(),
});

const removeUserRoleGroupAppsSchema = Joi.object({
  user_role_group_apps: Joi.array().items(Joi.number()).required(),
});

const updateAccessDomainSchema = Joi.object({
  accessDomains: Joi.object()
    .keys({
      campuses: Joi.array().items(Joi.number()).optional(),
      colleges: Joi.array().items(Joi.number()).optional(),
      departments: Joi.array().items(Joi.number()).optional(),
      faculties: Joi.array().items(Joi.number()).optional(),
      programmes: Joi.array().items(Joi.number()).optional(),
    })
    .required(),
  userId: Joi.number().required(),
  roleId: Joi.number().required(),
  accessLevels: Joi.object()
    .keys({
      access_all_campuses: Joi.boolean().required(),
      access_all_colleges: Joi.boolean().optional(),
      access_all_departments: Joi.boolean().optional(),
      access_all_faculties: Joi.boolean().optional(),
      access_all_programmes: Joi.boolean().required(),
    })
    .required(),
});

module.exports = {
  createRoleSchema,
  updateRoleSchema,
  addRoleAppsWithFunctionSchema,
  addUserRolesSchema,
  assignRoleToUser,
  removeRoleAppFunctionsSchema,
  removeRoleUserRoleGroupAppsSchema,
  removeUserRoleGroupAppsSchema,
  updateAccessDomainSchema,
};
