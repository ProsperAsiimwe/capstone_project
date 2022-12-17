const { JoiValidator } = require('@middleware');
const { userRoleGroupSchema } = require('../schema/UserAccess');

const validateCreateUserRoleGroup = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    userRoleGroupSchema.createUserRoleGroupSchema
  );
};

const validateUpdateUserRoleGroup = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    userRoleGroupSchema.updateUserRoleGroupSchema
  );
};

module.exports = { validateCreateUserRoleGroup, validateUpdateUserRoleGroup };
