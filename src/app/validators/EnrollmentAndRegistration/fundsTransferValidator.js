const { JoiValidator } = require('@middleware');
const { fundsTransferSchema } = require('../schema/EnrollmentAndRegistration');

const validateFundsTransfer = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    fundsTransferSchema.createFundsTransferSchema
  );
};

const validateApproveFundsTransfer = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    fundsTransferSchema.approveFundsTransferSchema
  );
};

module.exports = {
  validateFundsTransfer,
  validateApproveFundsTransfer,
};
