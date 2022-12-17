const { JoiValidator } = require('@middleware');
const { chartOfAccountSchema } = require('../schema/UniversalPayments');

const validateCreateChartOfAccount = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    chartOfAccountSchema.createChartOfAccountSchema
  );
};

const validateCreateAccountReceivable = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    chartOfAccountSchema.createAccountReceivableSchema
  );
};

const validateApproveAccountReceivable = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    chartOfAccountSchema.approveAccountReceivableSchema
  );
};

module.exports = {
  validateCreateChartOfAccount,
  validateCreateAccountReceivable,
  validateApproveAccountReceivable,
};
