const { JoiValidator } = require('@middleware');
const {
  applicantRelevantQualificationSchema,
} = require('../schema/Admissions');

const validateCreateApplicantRelevantQualification = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantRelevantQualificationSchema.createApplicantRelevantQualificationSchema
  );
};

const validateUpdateApplicantRelevantQualification = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantRelevantQualificationSchema.updateApplicantRelevantQualificationSchema
  );
};

module.exports = {
  validateCreateApplicantRelevantQualification,
  validateUpdateApplicantRelevantQualification,
};
