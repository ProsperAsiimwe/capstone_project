const { JoiValidator } = require('@middleware');
const { tuitionAmountSchema } = require('../schema/FeesManager');

const validateCreateTuitionAmount = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    tuitionAmountSchema.createTuitionAmountSchema
  );
};

const validateUpdateTuitionAmount = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    tuitionAmountSchema.updateTuitionAmountSchema
  );
};

const validateApproveAmounts = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    tuitionAmountSchema.approveAmountsSchema
  );
};

const validateAddTuitionAmountElements = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    tuitionAmountSchema.addTuitionAmountElementsSchema
  );
};

const validateUpdateTuitionAmountElement = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    tuitionAmountSchema.updateTuitionAmountElementsSchema
  );
};

module.exports = {
  validateCreateTuitionAmount,
  validateUpdateTuitionAmount,
  validateApproveAmounts,
  validateAddTuitionAmountElements,
  validateUpdateTuitionAmountElement,
};
