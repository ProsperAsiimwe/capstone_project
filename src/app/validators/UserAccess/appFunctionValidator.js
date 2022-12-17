const { JoiValidator } = require('@middleware');
const { appFunctionSchema } = require('../schema/UserAccess');

const validateCreateAppFunction = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    appFunctionSchema.createAppFunctionSchema
  );
};

const validateUpdateAppFunction = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    appFunctionSchema.updateAppFunctionSchema
  );
};

module.exports = { validateCreateAppFunction, validateUpdateAppFunction };
