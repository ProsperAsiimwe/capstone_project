const { JoiValidator } = require('@middleware');
const { applicantNextOfKinSchema } = require('../schema/Admissions');

const validateCreateApplicantNextOfKin = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantNextOfKinSchema.createApplicantNextOfKinSchema
  );
};

const validateUpdateApplicantNextOfKin = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantNextOfKinSchema.updateApplicantNextOfKinSchema
  );
};

module.exports = {
  validateCreateApplicantNextOfKin,
  validateUpdateApplicantNextOfKin,
};
