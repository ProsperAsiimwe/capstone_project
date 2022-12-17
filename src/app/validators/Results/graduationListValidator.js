const { JoiValidator } = require('@middleware');
const { graduationListSchema } = require('../schema/Results');

const validateProvisionalGradList = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    graduationListSchema.administrativeProvisionalGradListSchema
  );
};
const validatePushToProvisionalSchema = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    graduationListSchema.pushToProvisionalSchema
  );
};

const validateProvisionalAcademicYear = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    graduationListSchema.provisionalGradListAcademicYearSchema
  );
};

const validateGraduateStudents = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    graduationListSchema.graduateStudentsSchema
  );
};

const validatePushToGraduationList = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    graduationListSchema.pushToGraduationListSchema
  );
};

const validateGenerateSenateReport = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    graduationListSchema.generateSenateReportSchema
  );
};

const validateUpdateGraduationListAcademicYear = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    graduationListSchema.updateGraduationListAcademicYearSchema
  );
};

const validateUpdateFinalGraduationListYear = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    graduationListSchema.updateFinalGraduationListSchema
  );
};

const validateBillStudentsOnGraduationList = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    graduationListSchema.billStudentsOnGraduationListSchema
  );
};

module.exports = {
  validateProvisionalGradList,
  validateGraduateStudents,
  validateProvisionalAcademicYear,
  validateGenerateSenateReport,
  validatePushToGraduationList,
  validateUpdateGraduationListAcademicYear,
  validateUpdateFinalGraduationListYear,
  validatePushToProvisionalSchema,
  validateBillStudentsOnGraduationList,
};
