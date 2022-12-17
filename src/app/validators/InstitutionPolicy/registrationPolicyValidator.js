const { JoiValidator } = require('@middleware');
const { registrationPolicySchema } = require('../schema/InstitutionPolicy');

const validateCreateRegistrationPolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    registrationPolicySchema.createRegistrationPolicySchema
  );
};

const validateUpdateRegistrationPolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    registrationPolicySchema.updateRegistrationPolicySchema
  );
};

module.exports = {
  validateCreateRegistrationPolicy,
  validateUpdateRegistrationPolicy,
};
