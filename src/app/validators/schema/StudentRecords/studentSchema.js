const Joi = require('joi');

const createStudentSchema = Joi.object({
  // Personal Details
  surname: Joi.string().required(),
  other_names: Joi.string().required(),

  emis_number: Joi.string(),
  phone: Joi.string().required(),
  email: Joi.string().required(),
  date_of_birth: Joi.string().required(),
  home_district: Joi.string().required(),
  nationality: Joi.string().required(),
  national_id_number: Joi.string(),
  passport_id_number: Joi.string(),
  religion: Joi.string().required(),
  guardian_name: Joi.string().required(),
  guardian_email: Joi.string(),
  guardian_phone: Joi.string().required(),
  guardian_relationship: Joi.string().required(),
  guardian_address: Joi.string().required(),
  password: Joi.string(),
  gender: Joi.string().required(),
  avatar: Joi.string(),
  // Academic Details
  applicant_id: Joi.number(),
  programme_id: Joi.number().required(),
  programme_type_id: Joi.number().required(),
  programme_version_id: Joi.number().required(),
  programme_version_plan_id: Joi.number(),
  specialization_id: Joi.number(),
  subject_combination_id: Joi.number(),
  major_subject_id: Joi.number(),
  minor_subject_id: Joi.number(),
  fees_waiver_id: Joi.number(),
  entry_academic_year_id: Joi.number().required(),
  entry_study_year_id: Joi.number().required(),
  current_study_year_id: Joi.number().required(),
  intake_id: Joi.number().required(),
  campus_id: Joi.number().required(),
  sponsorship_id: Joi.number().required(),
  billing_category_id: Joi.number().required(),
  residence_status_id: Joi.number().required(),
  hall_of_attachment_id: Joi.number().required(),
  hall_of_residence_id: Joi.number(),
  student_academic_status_id: Joi.number().required(),
  marital_status_id: Joi.number().required(),
  old_student_number: Joi.string(),
  registration_number: Joi.string().required(),
  student_number: Joi.string().required(),
  is_current_programme: Joi.boolean(),
  is_on_loan_scheme: Joi.boolean(),
  is_affiliated: Joi.boolean(),
  affiliate_institute_name: Joi.string(),
  has_completed: Joi.boolean(),
  sponsor: Joi.string(),
});

const updateStudentPersonalDetailsSchema = Joi.object({
  surname: Joi.string(),
  other_names: Joi.string(),
  emis_number: Joi.string().allow(null, ''),
  phone: Joi.string(),
  email: Joi.string(),
  date_of_birth: Joi.string().allow(null, ''),
  home_district: Joi.string().allow(null, ''),
  nationality: Joi.string().allow(null, ''),
  national_id_number: Joi.string().allow(null, ''),
  passport_id_number: Joi.string().allow(null, ''),
  religion: Joi.string().allow(null, ''),
  guardian_name: Joi.string().allow(null, ''),
  guardian_email: Joi.string().allow(null, ''),
  guardian_phone: Joi.string().allow(null, ''),
  guardian_relationship: Joi.string().allow(null, ''),
  guardian_address: Joi.string().allow(null, ''),
  gender: Joi.string(),
});

const students = Joi.object().keys({
  student_id: Joi.number().required(),
  student_account_status_id: Joi.number().required(),
  academic_year_id: Joi.number().required(),
  reason: Joi.string().required(),
});

const updateStudentAccountStatusSchema = Joi.object({
  students: Joi.array().items(students).required(),
});

const createStudentProgrammeSchema = Joi.object({
  student_id: Joi.number().required(),
  applicant_id: Joi.number(),
  programme_id: Joi.number().required(),
  programme_type_id: Joi.number().required(),
  programme_version_id: Joi.number().required(),
  programme_version_plan_id: Joi.number(),
  specialization_id: Joi.number(),
  subject_combination_id: Joi.number(),
  major_subject_id: Joi.number(),
  minor_subject_id: Joi.number(),
  fees_waiver_id: Joi.number(),
  entry_academic_year_id: Joi.number().required(),
  entry_study_year_id: Joi.number().required(),
  current_study_year_id: Joi.number().required(),
  intake_id: Joi.number().required(),
  campus_id: Joi.number().required(),
  sponsorship_id: Joi.number().required(),
  billing_category_id: Joi.number().required(),
  residence_status_id: Joi.number().required(),
  hall_of_attachment_id: Joi.number().required(),
  hall_of_residence_id: Joi.number(),
  student_academic_status_id: Joi.number().required(),
  marital_status_id: Joi.number().required(),
  old_student_number: Joi.string(),
  registration_number: Joi.string().required(),
  student_number: Joi.string().required(),
  is_current_programme: Joi.boolean(),
  is_on_loan_scheme: Joi.boolean(),
  is_affiliated: Joi.boolean(),
  affiliate_institute_name: Joi.string(),
  has_completed: Joi.boolean(),
  sponsor: Joi.string(),
});

const updateStudentAcademicDetailsSchema = Joi.object({
  programme_id: Joi.number().required(),
  programme_type_id: Joi.number().required(),
  programme_version_id: Joi.number().required(),
  programme_version_plan_id: Joi.number(),
  specialization_id: Joi.number().allow(null, ''),
  subject_combination_id: Joi.number().allow(null, ''),
  major_subject_id: Joi.number().allow(null, ''),
  minor_subject_id: Joi.number().allow(null, ''),
  entry_academic_year_id: Joi.number().required(),
  entry_study_year_id: Joi.number().required(),
  current_study_year_id: Joi.number().required(),
  intake_id: Joi.number().required(),
  campus_id: Joi.number().required(),
  residence_status_id: Joi.number().required(),
  hall_of_attachment_id: Joi.number().required(),
  hall_of_residence_id: Joi.any().allow(null, ''),
  student_academic_status_id: Joi.number(),
  marital_status_id: Joi.number().required(),
  old_student_number: Joi.string().allow(null, ''),
  registration_number: Joi.string().required(),
  student_number: Joi.string().required(),
  is_current_programme: Joi.boolean(),
  is_on_loan_scheme: Joi.boolean(),
  is_affiliated: Joi.boolean(),
  affiliate_institute_name: Joi.string().allow(null, ''),
  has_completed: Joi.boolean().allow(null, ''),
});

const updateStudentSponsorshipDetailsSchema = Joi.object({
  fees_waiver_id: Joi.number().allow(null, ''),
  sponsorship_id: Joi.number().required(),
  billing_category_id: Joi.number().required(),
  sponsor: Joi.string().allow(null, ''),
});

const studentDocumentVerificationSchema = Joi.object({
  programme_id: Joi.number().required(),
  documents_verified: Joi.boolean().required(),
});

const updateStudentPasswordSchema = Joi.object({
  old_password: Joi.string().required(),
  new_password: Joi.string().required(),
  confirm_new_password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  username: Joi.string().required(),
});

const studentAcademicStatusSchema = Joi.object({
  academic_year_id: Joi.number().required(),
  student_academic_status_id: Joi.number().required(),
  reason: Joi.string().required(),
  actions: Joi.array().required(),
  active_until: Joi.date().required(),
});

const approveStudentCreationSchema = Joi.object({
  requests: Joi.array().items(Joi.number()).required(),
  comments: Joi.string(),
});

const pushStudentsToSICSchema = Joi.object({
  applicants: Joi.array().items(Joi.number()).required(),
});

module.exports = {
  createStudentSchema,
  updateStudentPersonalDetailsSchema,
  createStudentProgrammeSchema,
  updateStudentAcademicDetailsSchema,
  updateStudentSponsorshipDetailsSchema,
  studentDocumentVerificationSchema,
  updateStudentPasswordSchema,
  forgotPasswordSchema,
  studentAcademicStatusSchema,
  approveStudentCreationSchema,
  pushStudentsToSICSchema,
  updateStudentAccountStatusSchema,
};
