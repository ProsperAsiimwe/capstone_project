const { JoiValidator } = require('@middleware');
const { feesElementSchema } = require('../schema/FeesManager');

const validateCreateFeesElement = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    feesElementSchema.createFeesElementSchema
  );
};

const validateUpdateFeesElement = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    feesElementSchema.updateFeesElementSchema
  );
};

module.exports = { validateCreateFeesElement, validateUpdateFeesElement };
