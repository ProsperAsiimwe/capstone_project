const { JoiValidator } = require('@middleware');
const { applicantPermanentAddressSchema } = require('../schema/Admissions');

const validateCreateApplicantPermanentAddress = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantPermanentAddressSchema.createApplicantPermanentAddressSchema
  );
};

const validateUpdateApplicantPermanentAddress = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantPermanentAddressSchema.updateApplicantPermanentAddressSchema
  );
};

module.exports = {
  validateCreateApplicantPermanentAddress,
  validateUpdateApplicantPermanentAddress,
};
