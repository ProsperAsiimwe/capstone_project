const { JoiValidator } = require('@middleware');
const { applicantBioDataSchema } = require('../schema/Admissions');

const validateCreateApplicantBioData = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantBioDataSchema.createApplicantBioDataSchema
  );
};

const validateUpdateApplicantBioData = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantBioDataSchema.updateApplicantBioDataSchema
  );
};

const validateUpdateApplicantBioDataByStaff = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantBioDataSchema.updateApplicantBioDataByStaffSchema
  );
};

module.exports = {
  validateCreateApplicantBioData,
  validateUpdateApplicantBioData,
  validateUpdateApplicantBioDataByStaff,
};
