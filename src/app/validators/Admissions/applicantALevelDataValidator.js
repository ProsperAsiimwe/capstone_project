const { JoiValidator } = require('@middleware');
const { applicantALevelDataSchema } = require('../schema/Admissions');

const validateCreateApplicantALevelData = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantALevelDataSchema.createApplicantALevelDataSchema
  );
};
const validateUpdateApplicantALevelData = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantALevelDataSchema.updateApplicantALevelDataSchema
  );
};
const validateUpdateApplicantALevelDataByStaff = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantALevelDataSchema.updateApplicantALevelDataByStaffSchema
  );
};

module.exports = {
  validateCreateApplicantALevelData,
  validateUpdateApplicantALevelData,
  validateUpdateApplicantALevelDataByStaff,
};
