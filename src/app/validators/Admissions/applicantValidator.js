const { JoiValidator } = require('@middleware');
const { applicantSchema } = require('../schema/Admissions');

const validateCreateApplicant = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantSchema.createApplicantSchema
  );
};

const validateUpdateApplicant = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantSchema.updateApplicantSchema
  );
};

module.exports = {
  validateCreateApplicant,
  validateUpdateApplicant,
};
