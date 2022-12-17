const { JoiValidator } = require('@middleware');
const { surchargePolicySchema } = require('../schema/InstitutionPolicy');

const validateCreateSurchargePolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    surchargePolicySchema.createSurchargePolicySchema
  );
};

const validateUpdateSurchargePolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    surchargePolicySchema.updateSurchargePolicySchema
  );
};

const validateRevokeSurchargeInvoice = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    surchargePolicySchema.revokeSurchargeInvoiceSchema
  );
};

const validateRequestDeleteSurchargeInvoice = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    surchargePolicySchema.requestRevokeSurchargeInvoiceSchema
  );
};

module.exports = {
  validateCreateSurchargePolicy,
  validateUpdateSurchargePolicy,
  validateRevokeSurchargeInvoice,
  validateRequestDeleteSurchargeInvoice,
};
