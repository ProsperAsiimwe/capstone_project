const Joi = require('joi');

// array of multiple course unit group objects without a lecturer attached
const courseUnitGroupsPayload = Joi.object().keys({
  group_name: Joi.string().required(),
  capacity: Joi.number().required(),
});

// array of multiple lecturer objects
const lecturersPayload = Joi.object().keys({
  lecturer_id: Joi.number().required(),
  is_course_coordinator: Joi.boolean().required(),
  can_upload_marks: Joi.boolean().required(),
  groups: Joi.array().items(courseUnitGroupsPayload),
});

// create a course assignment record
const courseAssignmentSchema = Joi.object({
  campus_id: Joi.number().required(),
  academic_year_id: Joi.number().required(),
  semester_id: Joi.number().required(),
  intake_id: Joi.number().required(),
  department_id: Joi.number().required(),
  programme_id: Joi.number().required(),
  programme_types: Joi.array().items(Joi.number()).required(),
  programme_version_id: Joi.number().required(),
  course_unit: Joi.object({
    programme_version_course_unit_id: Joi.number().required(),
    is_split: Joi.boolean(),
    lecturers: Joi.array().items(lecturersPayload).required(),
    has_course_work_and_final_mark: Joi.boolean().required(),
  }),
});

// update a course assignment record
const updateCourseAssignmentSchema = Joi.object({
  campus_id: Joi.number().required(),
  academic_year_id: Joi.number().required(),
  semester_id: Joi.number().required(),
  intake_id: Joi.number().required(),
  department_id: Joi.number().required(),
  programme_id: Joi.number().required(),
  programme_type_id: Joi.number().required(),
  programme_version_id: Joi.number().required(),
});

// add more course units to an assignment context
const addCourseUnitsSchema = Joi.object({
  course_unit: Joi.object({
    programme_version_course_unit_id: Joi.number().required(),
    is_split: Joi.boolean(),
    lecturers: Joi.array().items(lecturersPayload).required(),
  }),
});

// array of multiple course unit group objects with a lecturer attached
const addCourseUnitGroupsPayload = Joi.object().keys({
  group_lecturer_id: Joi.number().required(),
  group_name: Joi.string().required(),
});

// add more groups to an assigned course-unit
const addCourseUnitGroupsSchema = Joi.object({
  course_unit_groups: Joi.array().items(addCourseUnitGroupsPayload).required(),
});

// add more lecturers to an assigned course unit
const addCourseUnitLecturersSchema = Joi.object({
  course_unit_lecturers: Joi.array().items(lecturersPayload).required(),
});

// update assigned course unit
const updateCourseUnitsSchema = Joi.object({
  programme_version_course_unit_id: Joi.number(),
  is_split: Joi.boolean(),
});

// update course unit group
const updateCourseUnitGroupsSchema = Joi.object({
  group_lecturer_id: Joi.number(),
  group_name: Joi.string(),
});

// update course unit lecturers
const updateCourseUnitLecturersSchema = Joi.object({
  is_course_coordinator: Joi.boolean(),
  can_upload_marks: Joi.boolean(),
});

module.exports = {
  courseAssignmentSchema,
  updateCourseAssignmentSchema,
  addCourseUnitsSchema,
  addCourseUnitGroupsSchema,
  addCourseUnitLecturersSchema,
  updateCourseUnitsSchema,
  updateCourseUnitGroupsSchema,
  updateCourseUnitLecturersSchema,
};
