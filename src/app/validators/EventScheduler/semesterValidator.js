const { JoiValidator } = require('@middleware');
const { semesterSchema } = require('../schema/EventScheduler');

const validateCreateSemester = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    semesterSchema.createSemesterSchema
  );
};

const validateUpdateSemester = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    semesterSchema.updateSemesterSchema
  );
};

module.exports = { validateCreateSemester, validateUpdateSemester };
