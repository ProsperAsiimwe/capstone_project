const { JoiValidator } = require('@middleware');
const { studentSchema } = require('../schema/StudentRecords');

const validateCreateStudent = async (req, res, next) => {
  return await JoiValidator(req, res, next, studentSchema.createStudentSchema);
};

const validateUpdateStudentPersonalDetails = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    studentSchema.updateStudentPersonalDetailsSchema
  );
};

const validateUpdateStudentAccountStatus = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    studentSchema.updateStudentAccountStatusSchema
  );
};

const validateUpdateStudentAcademicDetails = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    studentSchema.updateStudentAcademicDetailsSchema
  );
};

const validateUpdateStudentSponsorshipDetails = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    studentSchema.updateStudentSponsorshipDetailsSchema
  );
};

const validateStudentDocumentVerification = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    studentSchema.studentDocumentVerificationSchema
  );
};

const validateCreateStudentProgramme = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    studentSchema.createStudentProgrammeSchema
  );
};
const validateUpdateStudentPassword = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    studentSchema.updateStudentPasswordSchema
  );
};
const validateForgotPassword = async (req, res, next) => {
  return await JoiValidator(req, res, next, studentSchema.forgotPasswordSchema);
};

const validateStudentAcademicStatus = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    studentSchema.studentAcademicStatusSchema
  );
};

const validateApproveStudentCreation = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    studentSchema.approveStudentCreationSchema
  );
};

const validatePushStudentsToSIC = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    studentSchema.pushStudentsToSICSchema
  );
};

module.exports = {
  validateCreateStudent,
  validateUpdateStudentPersonalDetails,
  validateCreateStudentProgramme,
  validateUpdateStudentAcademicDetails,
  validateUpdateStudentSponsorshipDetails,
  validateStudentDocumentVerification,
  validateUpdateStudentPassword,
  validateForgotPassword,
  validateStudentAcademicStatus,
  validateApproveStudentCreation,
  validatePushStudentsToSIC,
  validateUpdateStudentAccountStatus,
};
