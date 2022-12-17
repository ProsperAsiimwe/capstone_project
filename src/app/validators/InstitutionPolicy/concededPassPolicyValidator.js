const { JoiValidator } = require('@middleware');
const { concededPassPolicySchema } = require('../schema/InstitutionPolicy');

const validateCreateConcededPassPolicyPolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    concededPassPolicySchema.createConcededPassPolicySchema
  );
};

const validateUpdateConcededPassPolicyPolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    concededPassPolicySchema.updateConcededPassPolicySchema
  );
};

module.exports = {
  validateCreateConcededPassPolicyPolicy,
  validateUpdateConcededPassPolicyPolicy,
};
