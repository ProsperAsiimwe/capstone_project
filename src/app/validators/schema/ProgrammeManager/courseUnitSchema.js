const Joi = require('joi');

const courseUnitsPayload = Joi.object().keys({
  course_unit_id: Joi.number().required(),
  grading_id: Joi.number(),
  contribution_algorithm_id: Joi.number(),
  course_unit_semester_id: Joi.number(),
  course_unit_year_id: Joi.number(),
  course_unit_category_id: Joi.number(),
  number_of_assessments: Joi.number(),
  course_unit_status: Joi.string(),
});

const createCourseUnitSchema = Joi.object({
  programme_id: Joi.number().required(),
  programme_version_id: Joi.number().required(),
  module_id: Joi.number(),
  module_option_id: Joi.number(),
  grading_id: Joi.number().required(),
  contribution_algorithm_id: Joi.number().required(),
  course_unit_semester_id: Joi.number().required(),
  course_unit_year_id: Joi.number().required(),
  course_unit_category_id: Joi.number().required(),
  department_id: Joi.number(),
  course_unit_code: Joi.string().required().trim(),
  course_unit_name: Joi.string().required().trim(),
  credit_unit: Joi.number().required(),
  number_of_assessments: Joi.number(),
  course_unit_status: Joi.string(),
  lecture_hours: Joi.number(),
  clinical_hours: Joi.number(),
  practical_hours: Joi.number(),
  contact_hours: Joi.number(),
  tutorial_hours: Joi.number(),
  notional_hours: Joi.number(),
  field_work_hours: Joi.number(),
  has_prerequisite: Joi.boolean(),
  prerequisite_courses: Joi.array().items(Joi.number()),
  plans: Joi.array().items(Joi.number()).empty(),
  specializations: Joi.array().items(Joi.number()).empty(),
  subjects: Joi.array().items(Joi.number()).empty(),
  is_audited_course: Joi.boolean(),
  expect_result_upload: Joi.boolean().optional().allow(null),
});

const updateCourseUnitSchema = Joi.object({
  // Repo Data
  department_id: Joi.number(),
  subject_id: Joi.number(),
  course_unit_code: Joi.string().required(),
  course_unit_name: Joi.string().required(),
  credit_unit: Joi.number().required(),
  lecture_hours: Joi.number(),
  clinical_hours: Joi.number(),
  practical_hours: Joi.number(),
  contact_hours: Joi.number(),
  tutorial_hours: Joi.number(),
  notional_hours: Joi.number(),
  field_work_hours: Joi.number(),
  has_prerequisite: Joi.boolean(),
  prerequisite_courses: Joi.array().items(Joi.number()),
  expect_result_upload: Joi.boolean().optional().allow(null),
});

const addCourseUnitToPlanSchema = Joi.object({
  course_units: Joi.array().items(courseUnitsPayload).required(),
});

const addCourseUnitToSpecializationSchema = Joi.object({
  course_units: Joi.array().items(courseUnitsPayload).required(),
});

const addCourseUnitToSubjectSchema = Joi.object({
  course_units: Joi.array().items(courseUnitsPayload).required(),
});

const uploadCourseUnitSchema = Joi.object({
  programme_version_id: Joi.number().required(),
});

module.exports = {
  createCourseUnitSchema,
  updateCourseUnitSchema,
  uploadCourseUnitSchema,
  addCourseUnitToPlanSchema,
  addCourseUnitToSpecializationSchema,
  addCourseUnitToSubjectSchema,
};
