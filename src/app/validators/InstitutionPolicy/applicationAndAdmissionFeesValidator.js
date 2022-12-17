const { JoiValidator } = require('@middleware');
const {
  applicationAndAdmissionFeesSchema,
} = require('../schema/InstitutionPolicy');

const validateCreateApplicationFeesPolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicationAndAdmissionFeesSchema.createApplicationFeesPolicySchema
  );
};

const validateCreateAdmissionFeesPolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicationAndAdmissionFeesSchema.createAdmissionFeesPolicySchema
  );
};

module.exports = {
  validateCreateApplicationFeesPolicy,
  validateCreateAdmissionFeesPolicy,
};
