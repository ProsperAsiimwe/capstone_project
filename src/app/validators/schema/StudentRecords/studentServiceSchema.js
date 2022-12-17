const Joi = require('joi');

const createStudentServiceSchema = Joi.object({
  academic_year_id: Joi.number().required(),
  semester_id: Joi.number(),
  new_study_year_id: Joi.number().required(),
  event_id: Joi.number().required(),
  new_programme_id: Joi.number().required(),
  new_programme_version_id: Joi.number(),
  new_programme_type_id: Joi.number().required(),
  new_campus_id: Joi.number().required(),
  new_subject_comb_id: Joi.number(),
  reason: Joi.string().required(),
  service: Joi.string().required(),
});

const approveStudentServiceSchema = Joi.object({
  changeOfProgrammeIds: Joi.array().items(Joi.number()).required(),
});

const acceptOrDeclineStudentServiceSchema = Joi.object({
  changeOfProgrammeIds: Joi.array().items(Joi.number()).required(),
  request_status: Joi.string().allow('DECLINED', 'ACCEPTED'),
});

const validateEditAcademicYearServiceSchema = Joi.object({
  changeOfProgrammeIds: Joi.array().items(Joi.number()).required(),
  academic_year_id: Joi.number().required(),
});

module.exports = {
  createStudentServiceSchema,
  approveStudentServiceSchema,
  acceptOrDeclineStudentServiceSchema,
  validateEditAcademicYearServiceSchema,
};
