const Joi = require('joi');

const courseUnitsToBeRetaken = Joi.object().keys({
  course_unit_id: Joi.number().required(),
  course_unit_status_id: Joi.number().required(),
});

const enrollmentByStaffSchema = Joi.object({
  student_programme_id: Joi.number().required(),
  event_id: Joi.number().required(),
  study_year_id: Joi.number().required(),
  enrollment_status_id: Joi.number().required(),
  comment: Joi.string(),
  plan_id: Joi.number(),
  specialization_id: Joi.number(),
  major_subject_id: Joi.number(),
  minor_subject_id: Joi.number(),
  retakes: Joi.array().items(courseUnitsToBeRetaken),
});

const lateEnrollmentByStaffSchema = Joi.object({
  student_programme_id: Joi.number().required(),
  academic_year_id: Joi.number().required(),
  study_year_id: Joi.number().required(),
  semester_id: Joi.number().required(),
  enrollment_status_id: Joi.number().required(),
  add_invoices: Joi.boolean().required(),
  add_late_enrollment_surcharge: Joi.boolean().required(),
  comment: Joi.string().required(),
  plan_id: Joi.number(),
  specialization_id: Joi.number(),
  major_subject_id: Joi.number(),
  minor_subject_id: Joi.number(),
  retakes: Joi.array().items(courseUnitsToBeRetaken),
});

const updateEnrollmentByStaffSchema = Joi.object({
  student_id: Joi.number().required(),
  event_id: Joi.number().required(),
  study_year_id: Joi.number().required(),
  enrollment_status_id: Joi.number().required(),
});

const enrollmentByStudentSchema = Joi.object({
  student_programme_id: Joi.number().required(),
  event_id: Joi.number().required(),
  study_year_id: Joi.number().required(),
  enrollment_status_id: Joi.number().required(),
  plan_id: Joi.number(),
  specialization_id: Joi.number(),
  major_subject_id: Joi.number(),
  minor_subject_id: Joi.number(),
  retakes: Joi.array().items(courseUnitsToBeRetaken),
});

const deEnrollmentSchema = Joi.object({
  enrollment_id: Joi.number().required(),
  student_programme_id: Joi.number().required(),
  comment: Joi.string().required(),
});

const billPreviousEnrollmentSchema = Joi.object({
  previous_enrollment_ids: Joi.array().items(Joi.number()).required(),
});

module.exports = {
  enrollmentByStaffSchema,
  updateEnrollmentByStaffSchema,
  enrollmentByStudentSchema,
  lateEnrollmentByStaffSchema,
  deEnrollmentSchema,
  billPreviousEnrollmentSchema,
};
