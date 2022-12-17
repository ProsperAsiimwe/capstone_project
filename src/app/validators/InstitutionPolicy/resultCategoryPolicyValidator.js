const { JoiValidator } = require('@middleware');
const { resultCategoryPolicySchema } = require('../schema/InstitutionPolicy');

const validateCreateResultCategoryPolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    resultCategoryPolicySchema.createResultCategoryPolicySchema
  );
};

const validateUpdateResultCategoryPolicyItem = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    resultCategoryPolicySchema.updateResultCategoryPolicyItemSchema
  );
};

module.exports = {
  validateCreateResultCategoryPolicy,
  validateUpdateResultCategoryPolicyItem,
};
