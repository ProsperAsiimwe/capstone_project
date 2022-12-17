const { JoiValidator } = require('@middleware');
const { securityProfileSchema } = require('../schema/UserAccess');

const validateCreateSecurityProfile = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    securityProfileSchema.createSecurityProfileSchema
  );
};

const validateUpdateSecurityProfile = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    securityProfileSchema.updateSecurityProfileSchema
  );
};

module.exports = {
  validateCreateSecurityProfile,
  validateUpdateSecurityProfile,
};
