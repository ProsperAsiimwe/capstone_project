const { JoiValidator } = require('@middleware');
const { academicYearFeesPolicySchema } = require('../schema/InstitutionPolicy');

const validateCreateAcademicYearFeesPolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    academicYearFeesPolicySchema.createAcademicYearFeesPolicySchema
  );
};

module.exports = {
  validateCreateAcademicYearFeesPolicy,
};
