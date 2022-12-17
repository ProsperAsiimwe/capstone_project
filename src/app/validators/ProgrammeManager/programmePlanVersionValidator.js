const { JoiValidator } = require('@middleware');
const { programmeVersionPlanSchema } = require('../schema/ProgrammeManager');

const validateCreateProgrammeVersionPlan = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    programmeVersionPlanSchema.createProgrammeVersionPlanSchema
  );
};

module.exports = { validateCreateProgrammeVersionPlan };
