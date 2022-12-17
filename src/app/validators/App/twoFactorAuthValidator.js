const { JoiValidator } = require('@middleware');
const { twoFactorAuthSchema } = require('../schema/App');

const validateEnterTwoFactorAuthOTP = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    twoFactorAuthSchema.enterTwoFactorAuthOTPSchema
  );
};

const validateCreateTwoFactorAuthOTP = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    twoFactorAuthSchema.createTwoFactorAuthOTPSchema
  );
};

module.exports = {
  validateEnterTwoFactorAuthOTP,
  validateCreateTwoFactorAuthOTP,
};
