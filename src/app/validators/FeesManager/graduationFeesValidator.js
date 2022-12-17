const { JoiValidator } = require('@middleware');
const { graduationFeesSchema } = require('../schema/FeesManager');

const validateCreateGraduationFees = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    graduationFeesSchema.createGraduationFeesSchema
  );
};

const validateUpdateGraduationFees = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    graduationFeesSchema.updateGraduationFeesSchema
  );
};

const validateApproveAmounts = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    graduationFeesSchema.approveAmountsSchema
  );
};

const validateAddGraduationFeesElements = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    graduationFeesSchema.addGraduationFeesElementsSchema
  );
};

const validateUpdateGraduationFeesElement = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    graduationFeesSchema.updateGraduationFeesElementsSchema
  );
};

module.exports = {
  validateCreateGraduationFees,
  validateUpdateGraduationFees,
  validateApproveAmounts,
  validateAddGraduationFeesElements,
  validateUpdateGraduationFeesElement,
};
