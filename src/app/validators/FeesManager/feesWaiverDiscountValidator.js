const { JoiValidator } = require('@middleware');
const { feesWaiverDiscountSchema } = require('../schema/FeesManager');

const validateCreateFeesWaiverDiscount = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    feesWaiverDiscountSchema.createFeesWaiverDiscountSchema
  );
};

const validateUpdateFeesWaiverDiscount = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    feesWaiverDiscountSchema.updateFeesWaiverDiscountSchema
  );
};

const validateApproveAmounts = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    feesWaiverDiscountSchema.approveAmountsSchema
  );
};

const validateAddDiscountedElements = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    feesWaiverDiscountSchema.addAmountElementsSchema
  );
};

const validateUpdateDiscountedElements = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    feesWaiverDiscountSchema.updateFeesWaiverDiscountedElementSchema
  );
};

module.exports = {
  validateCreateFeesWaiverDiscount,
  validateUpdateFeesWaiverDiscount,
  validateApproveAmounts,
  validateAddDiscountedElements,
  validateUpdateDiscountedElements,
};
