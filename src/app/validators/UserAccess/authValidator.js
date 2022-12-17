const { authSchema } = require('../schema/UserAccess');
const { JoiValidator } = require('@middleware');

const validateLogin = async (req, res, next) => {
  return await JoiValidator(req, res, next, authSchema.loginSchema);
};

const validateStudentLogin = async (req, res, next) => {
  return await JoiValidator(req, res, next, authSchema.studentLoginSchema);
};

const validateChangePassword = async (req, res, next) => {
  return await JoiValidator(req, res, next, authSchema.changePasswordSchema);
};

const validateRequestOTP = async (req, res, next) => {
  return await JoiValidator(req, res, next, authSchema.requestOTPSchema);
};

const validateResetPassword = async (req, res, next) => {
  return await JoiValidator(req, res, next, authSchema.resetPasswordSchema);
};

const validateSearchUser = async (req, res, next) => {
  return await JoiValidator(req, res, next, authSchema.searchUserSchema);
};

const validateResetStudentPassword = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    authSchema.resetStudentPasswordSchema
  );
};

const validateEditStudentContacts = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    authSchema.editStudentContactsSchema
  );
};

const validateRequestOTPStudent = async (req, res, next) => {
  return await JoiValidator(req, res, next, authSchema.requestOTPStudentSchema);
};

const validateChangeDefaultPassword = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    authSchema.changeDefaultPasswordSchema
  );
};

module.exports = {
  validateLogin,
  validateStudentLogin,
  validateChangePassword,
  validateChangeDefaultPassword,
  validateResetStudentPassword,
  validateRequestOTP,
  validateResetPassword,
  validateSearchUser,
  validateRequestOTPStudent,
  validateEditStudentContacts,
};
