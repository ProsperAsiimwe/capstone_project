const { JoiValidator } = require('@middleware');
const { academicYearSchema } = require('../schema/EventScheduler');

const validateCreateAcademicYear = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    academicYearSchema.createAcademicYearSchema
  );
};

const validateUpdateAcademicYear = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    academicYearSchema.updateAcademicYearSchema
  );
};

module.exports = { validateCreateAcademicYear, validateUpdateAcademicYear };
