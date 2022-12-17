const Joi = require('joi');

const createApplicantProgrammeChoiceSchema = Joi.object({
  running_admission_id: Joi.number().required(),
  section_id: Joi.number().required(),
  form_id: Joi.string(),
  programme_campus_id: Joi.number().required(),
  entry_study_year_id: Joi.number().required(),
  sponsorship_id: Joi.number().required(),
  subject_combination_id: Joi.number(),
  choice_number_name: Joi.string().required(),
  choice_number: Joi.number().required(),
});

const updateApplicantProgrammeChoiceSchema = Joi.object({
  running_admission_id: Joi.number(),
  section_id: Joi.number(),
  form_id: Joi.string().required(),
  programme_campus_id: Joi.number().required(),
  entry_study_year_id: Joi.number().required(),
  sponsorship_id: Joi.number().required(),
  subject_combination_id: Joi.number(),
  choice_number_name: Joi.string().required(),
  choice_number: Joi.number().required(),
});

const updateAdmittedApplicantSchema = Joi.object({
  programme_id: Joi.number(),
  programme_type_id: Joi.number(),
  programme_version_id: Joi.number(),
  programme_alias_id: Joi.number(),
  entry_study_year_id: Joi.number(),
  mode_of_entry_id: Joi.number(),
  sponsorship_id: Joi.number(),
  campus_id: Joi.number(),
  subject_combination_id: Joi.number(),
  fees_waiver_id: Joi.number(),
  billing_category_id: Joi.number(),
  hall_of_attachment_id: Joi.number(),
  hall_of_residence_id: Joi.number(),
  residence_status_id: Joi.number(),
  admission_scheme_id: Joi.number(),
  sponsor_id: Joi.number(),
  surname: Joi.string(),

  other_names: Joi.string(),
  gender: Joi.string(),
  nationality: Joi.string(),
  a_level_index: Joi.string(),
  a_level_year: Joi.string(),
  phone: Joi.string(),
  email: Joi.string(),
  date_of_birth: Joi.string(),
  district_of_origin: Joi.string(),
  student_number: Joi.string().optional(),
  registration_number: Joi.string().optional(),
});

const generatePRNByStaffSchema = Joi.object({
  applicant_id: Joi.number().required(),
});

module.exports = {
  createApplicantProgrammeChoiceSchema,
  updateApplicantProgrammeChoiceSchema,
  updateAdmittedApplicantSchema,
  generatePRNByStaffSchema,
};
