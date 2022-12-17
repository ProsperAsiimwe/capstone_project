const { JoiValidator } = require('@middleware');
const { resultSchema } = require('../schema/Results');

const validateBulkUploadResults = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    resultSchema.createBulkUploadResult
  );
};

const validateUpdateResults = async (req, res, next) => {
  return await JoiValidator(req, res, next, resultSchema.updateResult);
};

const validateUpdateResultAcademicYear = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    resultSchema.updateResultAcademicYear
  );
};

const validateUpdateBatch = async (req, res, next) => {
  return await JoiValidator(req, res, next, resultSchema.updateResultBatch);
};

const validateUpdateBatchRecord = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    resultSchema.updateSingleBatchRecord
  );
};

const validateApproveResultCreation = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    resultSchema.approveResultCreationSchema
  );
};

const validateResultsTwoFA = async (req, res, next) => {
  return await JoiValidator(req, res, next, resultSchema.resultsTwoFASchema);
};

module.exports = {
  validateBulkUploadResults,
  validateUpdateResults,
  validateUpdateResultAcademicYear,
  validateUpdateBatch,
  validateUpdateBatchRecord,
  validateApproveResultCreation,
  validateResultsTwoFA,
};
