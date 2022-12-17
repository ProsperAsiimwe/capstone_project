const { JoiValidator } = require('@middleware');
const { progVersAdmCriteriaSchema } = require('../schema/ProgrammeManager');

const validateCreateProgVersAdmCriteria = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    progVersAdmCriteriaSchema.createProgVersAdmCriteriaSchema
  );
};

module.exports = { validateCreateProgVersAdmCriteria };
