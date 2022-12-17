const { JoiValidator } = require('@middleware');
const { gradingSchema } = require('../schema/ProgrammeManager');

const validateCreateGrading = async (req, res, next) => {
  return await JoiValidator(req, res, next, gradingSchema.createGradingSchema);
};

module.exports = { validateCreateGrading };
