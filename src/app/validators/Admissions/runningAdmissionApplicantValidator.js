const { JoiValidator } = require('@middleware');
const { runningAdmissionApplicantSchema } = require('../schema/Admissions');

const validateCreateRunningAdmissionApplicant = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    runningAdmissionApplicantSchema.createRunningAdmissionApplicantSchema
  );
};

const validateUpdateRunningAdmissionApplicant = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    runningAdmissionApplicantSchema.updateRunningAdmissionApplicantSchema
  );
};

const validateAdmitRunningAdmissionApplicant = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    runningAdmissionApplicantSchema.admitRunningAdmissionApplicantSchema
  );
};

const validateGeneratePRN = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    runningAdmissionApplicantSchema.generatePRNSchema
  );
};

module.exports = {
  validateCreateRunningAdmissionApplicant,
  validateUpdateRunningAdmissionApplicant,
  validateAdmitRunningAdmissionApplicant,
  validateGeneratePRN,
};
