const { JoiValidator } = require('@middleware');
const { semesterCourseLoadSchema } = require('../schema/CourseAssignment');

const validateCreateSemesterCourseLoad = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    semesterCourseLoadSchema.createSemesterCourseLoadSchema
  );
};

const validateUpdateSemesterCourseLoad = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    semesterCourseLoadSchema.updateSemesterCourseLoadSchema
  );
};

module.exports = {
  validateCreateSemesterCourseLoad,
  validateUpdateSemesterCourseLoad,
};
