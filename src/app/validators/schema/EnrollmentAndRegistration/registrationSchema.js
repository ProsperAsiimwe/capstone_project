const Joi = require('joi');

// Define the courseUnitsToBeRegistered object's format expected
const courseUnitsToBeRegistered = Joi.object().keys({
  course_unit_id: Joi.number().required(),
  course_unit_status_id: Joi.number().required(),
});

const registrationByStaffSchema = Joi.object({
  student_id: Joi.number().required(),
  event_id: Joi.number().required(),
  enrollment_id: Joi.number().required(),
  registration_type_id: Joi.number().required(),
  course_units: Joi.array().items(courseUnitsToBeRegistered).required(),
  comment: Joi.string(),
  provisional_registration_type_id: Joi.number(),
  provisional_registration_comment: Joi.string(),
});

const registrationByStudentSchema = Joi.object({
  event_id: Joi.number().required(),
  enrollment_id: Joi.number().required(),
  registration_type_id: Joi.number().required(),
  course_units: Joi.array().items(courseUnitsToBeRegistered).required(),
});

const lateRegistrationSchema = Joi.object({
  student_programme_id: Joi.number().required(),
  academic_year_id: Joi.number().required(),
  study_year_id: Joi.number().required(),
  semester_id: Joi.number().required(),
  registration_type_id: Joi.number().required(),
  comment: Joi.string().required(),
  add_late_registration_surcharge: Joi.boolean().required(),
  course_units: Joi.array().items(courseUnitsToBeRegistered).required(),
});

const updateRegistrationByStaffSchema = Joi.object({
  student_id: Joi.number(),
  event_id: Joi.number(),
  enrollment_id: Joi.number(),
  registration_type_id: Joi.number(),
  course_units: Joi.array().items(courseUnitsToBeRegistered),
});
const updateRegistrationByStudentSchema = Joi.object({
  event_id: Joi.number(),
  enrollment_id: Joi.number(),
  registration_type_id: Joi.number(),
  course_units: Joi.array().items(courseUnitsToBeRegistered),
});

const getCourseUnitsByStaffSchema = Joi.object({
  student_id: Joi.number().required(),
  event_id: Joi.number().required(),
});

const updateCourseUnitsSchema = Joi.object({
  course_units: Joi.array().items(courseUnitsToBeRegistered),
});

const deRegistrationSchema = Joi.object({
  registration_id: Joi.number().required(),
  student_programme_id: Joi.number().required(),
  comment: Joi.string().required(),
});

module.exports = {
  registrationByStaffSchema,
  registrationByStudentSchema,
  updateRegistrationByStaffSchema,
  updateRegistrationByStudentSchema,
  getCourseUnitsByStaffSchema,
  lateRegistrationSchema,
  deRegistrationSchema,
  updateCourseUnitsSchema,
};
