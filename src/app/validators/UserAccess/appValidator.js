const { JoiValidator } = require('@middleware');
const { appSchema } = require('../schema/UserAccess');

const validateCreateApp = async (req, res, next) => {
  return await JoiValidator(req, res, next, appSchema.createAppSchema);
};

const validateUpdateApp = async (req, res, next) => {
  return await JoiValidator(req, res, next, appSchema.updateAppSchema);
};

module.exports = { validateCreateApp, validateUpdateApp };
