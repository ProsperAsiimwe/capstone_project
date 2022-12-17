const Joi = require('joi');

// array of multiple lecturer objects
const courseLoads = Joi.object().keys({
  minimum_courses: Joi.number().required(),
  maximum_courses: Joi.number().required(),
  course_category_id: Joi.number().required(),
});

// create a course loads record
const createSemesterCourseLoadSchema = Joi.object({
  programme_id: Joi.number().required(),
  academic_years: Joi.array().items(Joi.number()).required(),
  semesters: Joi.array().items(Joi.number()).required(),
  programme_study_years: Joi.array().items(Joi.number()).required(),
  semesterLoads: Joi.array().items(courseLoads).required(),
});

// create a course loads record
const updateSemesterCourseLoadSchema = Joi.object({
  semesterLoads: Joi.array().items(courseLoads).required(),
});

module.exports = {
  createSemesterCourseLoadSchema,
  updateSemesterCourseLoadSchema,
};
