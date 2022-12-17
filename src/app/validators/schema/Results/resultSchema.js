const Joi = require('joi');

const createBulkUploadResult = Joi.object({
  student_registration_number: Joi.string().required(),
  programme_id: Joi.number().required(),
  version_id: Joi.number().required(),
  course_code: Joi.string().required(),
  academic_year_id: Joi.number().required(),
  study_year_id: Joi.number().required(),
  semester_id: Joi.number().required(),
  course_work: Joi.number().required(),
  final_exam: Joi.number().required(),
  final_mark: Joi.number().required(),
});

const updateResult = Joi.object({
  course_work: Joi.number(),
  final_exam: Joi.number(),
  final_mark: Joi.number().required(),
  otp: Joi.number().required(),
  operation: Joi.string().required(),
});

const updateResultAcademicYear = Joi.object({
  academic_year_id: Joi.number().required(),
  result_context_ids: Joi.array().items(Joi.number()).required(),
  student_programme_id: Joi.number().required(),
});

const updateResultBatch = Joi.object({
  academic_year_id: Joi.number().required(),
  study_year_id: Joi.number().required(),
});

const updateSingleBatchRecord = Joi.object({
  academic_year_id: Joi.number().required(),
  study_year_id: Joi.number().required(),
  course_work: Joi.number(),
  final_exam: Joi.number(),
  final_mark: Joi.number().required(),
  otp: Joi.number().required(),
  operation: Joi.string().required(),
});

const approveResultCreationSchema = Joi.object({
  requests: Joi.array().items(Joi.number()).required(),
  role_id: Joi.number(),
});

const resultsTwoFASchema = Joi.object({
  otp: Joi.number().required(),
  operation: Joi.string().required(),
});

module.exports = {
  createBulkUploadResult,
  updateResult,
  updateResultAcademicYear,
  updateResultBatch,
  updateSingleBatchRecord,
  approveResultCreationSchema,
  resultsTwoFASchema,
};
