const { JoiValidator } = require('@middleware');
const { graduateFeesPolicySchema } = require('../schema/InstitutionPolicy');

const validateCreateGraduateFeesPolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    graduateFeesPolicySchema.createGraduateFeesPolicySchema
  );
};

const validateUpdateGraduateFeesPolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    graduateFeesPolicySchema.updateGraduateFeesPolicySchema
  );
};

const validateAddNewGraduateFeesPolicyElements = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    graduateFeesPolicySchema.addNewGraduateFeesPolicyElementsSchema
  );
};

const validateDeleteGraduateFeesPolicyElements = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    graduateFeesPolicySchema.deleteGraduateFeesPolicyElementsSchema
  );
};

module.exports = {
  validateCreateGraduateFeesPolicy,
  validateUpdateGraduateFeesPolicy,
  validateAddNewGraduateFeesPolicyElements,
  validateDeleteGraduateFeesPolicyElements,
};
