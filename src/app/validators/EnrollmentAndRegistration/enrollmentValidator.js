const { JoiValidator } = require('@middleware');
const { enrollmentSchema } = require('../schema/EnrollmentAndRegistration');

const validateEnrollmentByStaff = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    enrollmentSchema.enrollmentByStaffSchema
  );
};

const validateUpdateEnrollmentByStaff = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    enrollmentSchema.updateEnrollmentByStaffSchema
  );
};

const validateEnrollmentByStudent = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    enrollmentSchema.enrollmentByStudentSchema
  );
};

const validateLateEnrollmentByStaff = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    enrollmentSchema.lateEnrollmentByStaffSchema
  );
};

const validateDeEnrollment = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    enrollmentSchema.deEnrollmentSchema
  );
};

const validateBillPreviousEnrollment = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    enrollmentSchema.billPreviousEnrollmentSchema
  );
};

module.exports = {
  validateEnrollmentByStaff,
  validateUpdateEnrollmentByStaff,
  validateEnrollmentByStudent,
  validateLateEnrollmentByStaff,
  validateDeEnrollment,
  validateBillPreviousEnrollment,
};
