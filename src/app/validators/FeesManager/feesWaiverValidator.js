const { JoiValidator } = require('@middleware');
const { feesWaiverSchema } = require('../schema/FeesManager');

const validateCreateFeesWaiver = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    feesWaiverSchema.createFeesWaiverSchema
  );
};

const validateUpdateFeesWaiver = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    feesWaiverSchema.updateFeesWaiverSchema
  );
};

module.exports = { validateCreateFeesWaiver, validateUpdateFeesWaiver };
