const { JoiValidator } = require('@middleware');
const { userSchema } = require('../schema/UserAccess');

const validateCreateUser = async (req, res, next) => {
  return await JoiValidator(req, res, next, userSchema.createUserSchema);
};

const validateUpdateUser = async (req, res, next) => {
  return await JoiValidator(req, res, next, userSchema.updateUserSchema);
};

const validateActivateUsers = async (req, res, next) => {
  return await JoiValidator(req, res, next, userSchema.activateUsersSchema);
};

const validateDeActivateUsers = async (req, res, next) => {
  return await JoiValidator(req, res, next, userSchema.deactivateUsersSchema);
};

const validateRemoveRoles = async (req, res, next) => {
  return await JoiValidator(req, res, next, userSchema.removeRolesSchema);
};

module.exports = {
  validateCreateUser,
  validateUpdateUser,
  validateRemoveRoles,
  validateActivateUsers,
  validateDeActivateUsers,
};
