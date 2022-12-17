const { JoiValidator } = require('@middleware');
const { feesCopySchema } = require('../schema/FeesManager');

const validateCreateFeesCopy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    feesCopySchema.createFeesCopySchema
  );
};

module.exports = { validateCreateFeesCopy };
