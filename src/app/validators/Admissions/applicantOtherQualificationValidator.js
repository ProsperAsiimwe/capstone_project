const { JoiValidator } = require('@middleware');
const { applicantOtherQualificationSchema } = require('../schema/Admissions');

const validateCreateApplicantOtherQualification = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantOtherQualificationSchema.createApplicantOtherQualificationSchema
  );
};

const validateUpdateApplicantOtherQualification = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantOtherQualificationSchema.updateApplicantOtherQualificationSchema
  );
};

module.exports = {
  validateCreateApplicantOtherQualification,
  validateUpdateApplicantOtherQualification,
};
