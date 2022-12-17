const { JoiValidator } = require('@middleware');
const { exemptedTuitionCampusSchema } = require('../schema/FeesManager');

const validateCreateExemptedTuitionCampuses = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    exemptedTuitionCampusSchema.createExemptedTuitionSchema
  );
};

module.exports = { validateCreateExemptedTuitionCampuses };
