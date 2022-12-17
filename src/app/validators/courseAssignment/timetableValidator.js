const { JoiValidator } = require('@middleware');
const { timetableSchema } = require('../schema/CourseAssignment');

const validateCreateTeachingTimetable = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    timetableSchema.createTeachingTimetableSchema
  );
};

const validateUpdateTeachingTimetable = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    timetableSchema.updateTeachingTimetableSchema
  );
};

module.exports = {
  validateCreateTeachingTimetable,
  validateUpdateTeachingTimetable,
};
