const Joi = require('joi');

const userRoles = Joi.object().keys({
  role_id: Joi.number().required(),
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

const createUserSchema = Joi.object({
  surname: Joi.string().required().trim().max(60),

  other_names: Joi.string().required().trim().max(60),

  email: Joi.string().email().required().trim().max(60),

  phone: Joi.string().required().trim().max(30),

  is_active: Joi.boolean(),

  has_temporary_access: Joi.boolean(),

  access_until: Joi.date(),

  staff_id: Joi.string().max(60),

  address: Joi.string(),

  office: Joi.string(),

  gender: Joi.string().required().max(20),

  avatar: Joi.string(),

  has_read_only_access: Joi.boolean(),

  role_group_id: Joi.number().integer().required(),

  campus_id: Joi.number().integer().required(),

  salutation_id: Joi.number().integer().required(),

  report_to_user_id: Joi.number().integer(),

  roles: Joi.array().items(userRoles).required(),
});

/**
 *
 *
 * update user
 */

const updateUserSchema = Joi.object({
  surname: Joi.string().trim().max(60),

  other_names: Joi.string().trim().max(60),

  email: Joi.string().email().trim().max(60),

  phone: Joi.string().trim().max(30),

  is_active: Joi.boolean(),

  narration: Joi.string(),

  has_temporary_access: Joi.boolean(),

  access_until: Joi.date(),

  staff_id: Joi.string().max(60),

  address: Joi.string(),

  office: Joi.string(),

  gender: Joi.string().max(20),

  avatar: Joi.string(),

  has_read_only_access: Joi.boolean(),

  campus_id: Joi.number().integer(),

  salutation_id: Joi.number().integer(),

  report_to_user_id: Joi.number().integer(),
});

const removeRolesSchema = Joi.object({
  roles: Joi.array().items(Joi.number()).required(),
});

const activateUsersSchema = Joi.object({
  users: Joi.array().items(Joi.number()).required(),
  narration: Joi.string().required(),
});

const deactivateUsersSchema = Joi.object({
  users: Joi.array().items(Joi.number()).required(),
  narration: Joi.string().required(),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  removeRolesSchema,
  activateUsersSchema,
  deactivateUsersSchema,
};
