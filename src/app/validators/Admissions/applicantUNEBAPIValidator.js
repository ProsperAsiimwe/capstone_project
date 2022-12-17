const { JoiValidator } = require('@middleware');
const { applicantUNEBAPISchema } = require('../schema/Admissions');

const validateGetApplicantResult = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantUNEBAPISchema.getApplicantResultSchema
  );
};

module.exports = {
  validateGetApplicantResult,
};
