const { JoiValidator } = require('@middleware');
const { hallAllocationPolicySchema } = require('../schema/InstitutionPolicy');

const validateCreateHallAllocationPolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    hallAllocationPolicySchema.createHallAllocationPolicySchema
  );
};

const validateUpdateHallAllocationPolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    hallAllocationPolicySchema.updateHallAllocationPolicySchema
  );
};

module.exports = {
  validateCreateHallAllocationPolicy,
  validateUpdateHallAllocationPolicy,
};
