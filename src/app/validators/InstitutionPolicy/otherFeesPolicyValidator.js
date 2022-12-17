const { JoiValidator } = require('@middleware');
const { otherFeesPolicySchema } = require('../schema/InstitutionPolicy');

const validateCreateOtherFeesPolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    otherFeesPolicySchema.createOtherFeesPolicySchema
  );
};

const validateUpdateOtherFeesPolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    otherFeesPolicySchema.updateOtherFeesPolicySchema
  );
};

module.exports = {
  validateCreateOtherFeesPolicy,
  validateUpdateOtherFeesPolicy,
};
