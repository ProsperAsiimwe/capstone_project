const { JoiValidator } = require('@middleware');
const { registrationSchema } = require('../schema/EnrollmentAndRegistration');

const validateRegistrationByStaff = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    registrationSchema.registrationByStaffSchema
  );
};

const validateRegistrationByStudent = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    registrationSchema.registrationByStudentSchema
  );
};

const validateUpdateRegistrationByStaff = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    registrationSchema.updateRegistrationByStaffSchema
  );
};

const validateUpdateRegistrationByStudent = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    registrationSchema.updateRegistrationByStudentSchema
  );
};

const validateGetCourseUnitsByStaff = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    registrationSchema.getCourseUnitsByStaffSchema
  );
};

const validateLateRegistrationByStaff = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    registrationSchema.lateRegistrationSchema
  );
};

const validateUpdateCourseUnits = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    registrationSchema.updateCourseUnitsSchema
  );
};

const validateDeRegistration = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    registrationSchema.deRegistrationSchema
  );
};

module.exports = {
  validateRegistrationByStaff,
  validateUpdateRegistrationByStaff,
  validateRegistrationByStudent,
  validateUpdateRegistrationByStudent,
  validateGetCourseUnitsByStaff,
  validateLateRegistrationByStaff,
  validateDeRegistration,
  validateUpdateCourseUnits,
};
