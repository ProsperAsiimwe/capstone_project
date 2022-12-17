const { JoiValidator } = require('@middleware');
const { gradingValueSchema } = require('../schema/ProgrammeManager');

const validateCreateGradingValue = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    gradingValueSchema.createGradingValueSchema
  );
};

module.exports = { validateCreateGradingValue };
