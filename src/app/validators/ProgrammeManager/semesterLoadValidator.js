const { JoiValidator } = require('@middleware');
const { semesterLoadSchema } = require('../schema/ProgrammeManager');

const validateCreateSemesterLoad = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    semesterLoadSchema.createSemesterLoadSchema
  );
};
const validateUpdateSemesterLoad = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    semesterLoadSchema.updateSemesterLoadSchema
  );
};

module.exports = { validateCreateSemesterLoad, validateUpdateSemesterLoad };
