const { JoiValidator } = require('@middleware');
const { functionalFeesAmountSchema } = require('../schema/FeesManager');

const validateCreateFunctionalFeesAmount = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    functionalFeesAmountSchema.createFunctionalFeesAmountSchema
  );
};

const validateUpdateFunctionalFeesAmount = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    functionalFeesAmountSchema.updateFunctionalFeesAmountSchema
  );
};

const validateApproveAmounts = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    functionalFeesAmountSchema.approveAmountsSchema
  );
};

const validateAddAmountElements = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    functionalFeesAmountSchema.addAmountElementsSchema
  );
};

const validateUpdateFunctionalAmountElements = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    functionalFeesAmountSchema.updateFunctionalFeesAmountElementsSchema
  );
};

module.exports = {
  validateCreateFunctionalFeesAmount,
  validateUpdateFunctionalFeesAmount,
  validateApproveAmounts,
  validateAddAmountElements,
  validateUpdateFunctionalAmountElements,
};
