const { JoiValidator } = require('@middleware');
const { applicantOLevelDataSchema } = require('../schema/Admissions');

const validateCreateApplicantOLevelData = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantOLevelDataSchema.createApplicantOLevelDataSchema
  );
};
const validateUpdateApplicantOLevelData = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantOLevelDataSchema.updateApplicantOLevelDataSchema
  );
};
const validateUpdateApplicantOLevelDataByStaff = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantOLevelDataSchema.updateApplicantOLevelDataByStaffSchema
  );
};

module.exports = {
  validateCreateApplicantOLevelData,
  validateUpdateApplicantOLevelData,
  validateUpdateApplicantOLevelDataByStaff,
};
