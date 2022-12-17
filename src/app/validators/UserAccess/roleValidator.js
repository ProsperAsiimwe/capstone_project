const { JoiValidator } = require('@middleware');
const { userRoleSchema } = require('../schema/UserAccess');

const validateCreateRole = async (req, res, next) => {
  return await JoiValidator(req, res, next, userRoleSchema.createRoleSchema);
};

const validateUpdateRole = async (req, res, next) => {
  return await JoiValidator(req, res, next, userRoleSchema.updateRoleSchema);
};

const validateAddRoleApps = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    userRoleSchema.addRoleAppsWithFunctionSchema
  );
};

const validateAddUserRoles = async (req, res, next) => {
  return await JoiValidator(req, res, next, userRoleSchema.addUserRolesSchema);
};

const validateAssignRoleToUser = async (req, res, next) => {
  return await JoiValidator(req, res, next, userRoleSchema.assignRoleToUser);
};

const validateRemoveRoleAppFunctions = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    userRoleSchema.removeRoleAppFunctionsSchema
  );
};

const validateRemoveRoleUserRoleGroupApps = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    userRoleSchema.removeRoleUserRoleGroupAppsSchema
  );
};

const validateRemoveUserRoleGroupApps = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    userRoleSchema.removeUserRoleGroupAppsSchema
  );
};

const validateUpdateAccessDomain = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    userRoleSchema.updateAccessDomainSchema
  );
};

module.exports = {
  validateCreateRole,
  validateUpdateRole,
  validateAddRoleApps,
  validateAddUserRoles,
  validateAssignRoleToUser,
  validateRemoveRoleAppFunctions,
  validateRemoveRoleUserRoleGroupApps,
  validateRemoveUserRoleGroupApps,
  validateUpdateAccessDomain,
};
