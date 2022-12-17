const Joi = require('joi');

const programmeVersionPlansPayload = Joi.object().keys({
  programme_version_plan_id: Joi.number().required(),
  graduation_load: Joi.number().required(),
  plan_semester_id: Joi.number().required(),
  plan_study_year_id: Joi.number().required(),
});

const programmeVersionEntryYearsPayload = Joi.object().keys({
  entry_year_id: Joi.number().required(),
  graduation_load: Joi.number().required(),
});

const programmeVersionModulesPayload = Joi.object().keys({
  module_id: Joi.number().required(),
  has_module_options: Joi.boolean().empty().default(false),
  programme_version_module_options: Joi.array().items(Joi.number()).empty(),
});

const exemptedRegistrations = Joi.object().keys({
  study_year_id: Joi.number().required(),
  semester_id: Joi.number().required(),
});

const courseUnitsPayload = Joi.object().keys({
  course_unit_id: Joi.number().required(),
  grading_id: Joi.number().required(),
  contribution_algorithm_id: Joi.number().required(),
  course_unit_semester_id: Joi.number().required(),
  course_unit_year_id: Joi.number().required(),
  course_unit_category_id: Joi.number().required(),
  version_credit_units: Joi.number().required,
  expect_result_upload: Joi.boolean().required,
  number_of_assessments: Joi.number(),
  course_unit_status: Joi.string(),
});

const courseUnitPlansPayload = Joi.object().keys({
  programme_version_course_unit_id: Joi.number().required(),
});

const createProgrammeSchema = Joi.object({
  programme_code: Joi.string().required().trim(),
  programme_title: Joi.string().required().trim(),
  programme_study_level_id: Joi.number().required(),
  date_established: Joi.date(),
  headed_by_id: Joi.number(),
  department_id: Joi.number().required(),
  admission_type_id: Joi.number().optional(),
  version: Joi.string().required().trim(),
  award_id: Joi.number().required(),
  duration_measure_id: Joi.number().required(),
  programme_duration: Joi.number().required(),
  programme_description: Joi.string().empty('').trim(),
  admission_requirements: Joi.string().empty('').trim(),
  programme_study_types: Joi.array().items(Joi.number()).required(),
  programme_entry_years: Joi.array().items(Joi.number()).required(),
  version_entry_years: Joi.array().items(programmeVersionEntryYearsPayload),
  programme_campuses: Joi.array().items(Joi.number()).required(),
  has_specializations: Joi.boolean().empty().default(false),
  specialization_semester_id: Joi.number(),
  specialization_year_id: Joi.number(),
  has_subject_combination_categories: Joi.boolean().empty().default(false),
  subject_combination_semester_id: Joi.number(),
  subject_combination_year_id: Joi.number(),
  mode_of_delivery: Joi.array().items(Joi.number()).required(),
  subject_combination_categories: Joi.array().items(Joi.number()).empty(),
  programme_specializations: Joi.array().items(Joi.number()).empty(),
  has_version_plans: Joi.boolean().empty().default(false),
  programme_version_plans: Joi.array().items(programmeVersionPlansPayload),
  is_modular: Joi.boolean().empty().default(false),
  is_classified: Joi.boolean().empty().default(true),
  has_dissertation: Joi.boolean().empty().default(false),
  programme_version_modules: Joi.array().items(programmeVersionModulesPayload),
  other_departments: Joi.array().items(Joi.number()),
});

const createProgrammeVersionSchema = Joi.object({
  programme_id: Joi.number().required(),
  version_title: Joi.string().required(),
  version_entry_years: Joi.array().items(programmeVersionEntryYearsPayload),
  has_specializations: Joi.boolean().empty().default(false),
  is_default: Joi.boolean().empty().default(false),
  has_version_plans: Joi.boolean().empty().default(false),
  has_subject_combination_categories: Joi.boolean().empty().default(false),
  specialization_semester_id: Joi.number(),
  specialization_year_id: Joi.number(),
  subject_combination_semester_id: Joi.number(),
  subject_combination_year_id: Joi.number(),
  is_current_version: Joi.boolean().empty().default(false),
  subject_combination_categories: Joi.array().items(Joi.number()).empty(),
  programme_specializations: Joi.array().items(Joi.number()).empty(),
  programme_version_plans: Joi.array().items(programmeVersionPlansPayload),
  programme_version_modules: Joi.array().items(programmeVersionModulesPayload),
  has_exempt_registration: Joi.boolean().empty().default(false),
  exempted_registrations: Joi.array().items(exemptedRegistrations),
});

const createProgrammeVersionSubjectCombinationSchema = Joi.object({
  subject_combination_code: Joi.string().required(),
  subject_combination_title: Joi.string(),
  subjects: Joi.array().items(Joi.number()).required(),
});

const updateProgrammeSchema = Joi.object({
  programme_code: Joi.string().required().trim(),
  programme_title: Joi.string().required().trim(),
  programme_study_level_id: Joi.number().required(),
  date_established: Joi.date(),
  headed_by_id: Joi.number(),
  admission_type_id: Joi.number().optional(),
  department_id: Joi.number().required(),
  is_classified: Joi.boolean().empty().default(true),
  has_dissertation: Joi.boolean().empty().default(false),
  award_id: Joi.number().required(),
  duration_measure_id: Joi.number().required(),
  programme_duration: Joi.number().required(),
  programme_description: Joi.string().empty('').trim(),
  admission_requirements: Joi.string().empty('').trim(),
  programme_study_types: Joi.array().items(Joi.number()).required(),
  programme_entry_years: Joi.array().items(Joi.number()).required(),
  programme_campuses: Joi.array().items(Joi.number()).required(),
  mode_of_delivery: Joi.array().items(Joi.number()).required(),
  other_departments: Joi.array().items(Joi.number()),
});

const createProgrammeVersionCourseUnitsSchema = Joi.object({
  course_units: Joi.array().items(courseUnitsPayload).required(),
});

const createProgrammeVersionPlanCourseUnitsSchema = Joi.object({
  plan_course_units: Joi.array().items(courseUnitPlansPayload).required(),
});

const updateProgrammeVersionCourseUnitsSchema = Joi.object({
  // programme Version Data
  programme_version_id: Joi.number().required(),
  course_unit_id: Joi.number().required(),
  is_audited_course: Joi.boolean().required(),
  grading_id: Joi.number(),
  contribution_algorithm_id: Joi.number(),
  course_unit_semester_id: Joi.number().required(),
  course_unit_year_id: Joi.number().required(),
  course_unit_category_id: Joi.number().required(),
  number_of_assessments: Joi.number(),
  version_credit_units: Joi.number(),
  expect_result_upload: Joi.boolean(),
  course_unit_status: Joi.string(),
  plans: Joi.array().items(Joi.number()).empty(),
  specializations: Joi.array().items(Joi.number()).empty(),
  subjects: Joi.array().items(Joi.number()).empty(),

  // module_id: Joi.number(),
  // module_option_id: Joi.number(),
  // grading_id: Joi.number().required(),
  // contribution_algorithm_id: Joi.number().required(),
  // course_unit_semester_id: Joi.number().required(),
  // course_unit_year_id: Joi.number().required(),
  // course_unit_category_id: Joi.number().required(),
  // department_id: Joi.number(),
  // course_unit_code: Joi.string().required().trim(),
  // course_unit_name: Joi.string().required().trim(),
  // credit_unit: Joi.number().required(),
  // number_of_assessments: Joi.number(),
  // course_unit_status: Joi.string(),
  // lecture_hours: Joi.number(),
  // clinical_hours: Joi.number(),
  // practical_hours: Joi.number(),
  // contact_hours: Joi.number(),
  // tutorial_hours: Joi.number(),
  // notional_hours: Joi.number(),
  // field_work_hours: Joi.number(),
  // plans: Joi.array().items(Joi.number()).empty(),
  // specializations: Joi.array().items(Joi.number()).empty(),
  // subjects: Joi.array().items(Joi.number()).empty(),
});

module.exports = {
  createProgrammeSchema,
  updateProgrammeSchema,
  createProgrammeVersionCourseUnitsSchema,
  updateProgrammeVersionCourseUnitsSchema,
  createProgrammeVersionPlanCourseUnitsSchema,
  createProgrammeVersionSchema,
  createProgrammeVersionSubjectCombinationSchema,
};
