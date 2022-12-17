const { JoiValidator } = require('@middleware');
const { applicantMastersQualificationSchema } = require('../schema/Admissions');

const validateCreateApplicantMastersQualification = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantMastersQualificationSchema.createApplicantMastersQualificationSchema
  );
};

const validateUpdateApplicantMastersQualification = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantMastersQualificationSchema.updateApplicantMastersQualificationSchema
  );
};

module.exports = {
  validateCreateApplicantMastersQualification,
  validateUpdateApplicantMastersQualification,
};
