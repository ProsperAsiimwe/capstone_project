const { JoiValidator } = require('@middleware');
const { progVersPlanAdmCriteriaSchema } = require('../schema/ProgrammeManager');

const validateCreateProgVersPlanAdmCriteria = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    progVersPlanAdmCriteriaSchema.createProgVersPlanAdmCriteriaSchema
  );
};

module.exports = { validateCreateProgVersPlanAdmCriteria };
