const { JoiValidator } = require('@middleware');
const { otherFeesAmountSchema } = require('../schema/FeesManager');

const validateCreateOtherFeesAmount = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    otherFeesAmountSchema.createOtherFeesAmountSchema
  );
};

const validateUpdateOtherFeesAmount = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    otherFeesAmountSchema.updateOtherFeesAmountSchema
  );
};

const validateApproveAmounts = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    otherFeesAmountSchema.approveAmountsSchema
  );
};

const validateAddAmountElements = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    otherFeesAmountSchema.addAmountElementsSchema
  );
};

const validateUpdateOtherFeesAmountElement = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    otherFeesAmountSchema.updateOtherFeesAmountElementsSchema
  );
};

module.exports = {
  validateCreateOtherFeesAmount,
  validateUpdateOtherFeesAmount,
  validateApproveAmounts,
  validateAddAmountElements,
  validateUpdateOtherFeesAmountElement,
};
