const { JoiValidator } = require('@middleware');
const { applicantDiplomaQualificationSchema } = require('../schema/Admissions');

const validateCreateApplicantDiplomaQualification = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantDiplomaQualificationSchema.createApplicantDiplomaQualificationSchema
  );
};

const validateUpdateApplicantDiplomaQualification = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantDiplomaQualificationSchema.updateApplicantDiplomaQualificationSchema
  );
};

module.exports = {
  validateCreateApplicantDiplomaQualification,
  validateUpdateApplicantDiplomaQualification,
};
