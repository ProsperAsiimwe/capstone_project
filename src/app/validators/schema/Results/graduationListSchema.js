const Joi = require('joi');

const studentsForAdministrativeList = Joi.object().keys({
  student_programme_id: Joi.number().required(),
  cgpa: Joi.number().required(),
});

const administrativeProvisionalGradListSchema = Joi.object({
  graduation_academic_year_id: Joi.number().required(),
  programme_id: Joi.number().required(),
  campus_id: Joi.number().required(),
  intake_id: Joi.number().required(),
  narration: Joi.string().required(),
  students: Joi.array().items(studentsForAdministrativeList).required(),
});

const pushToProvisionalSchema = Joi.object({
  graduation_academic_year_id: Joi.number().required(),
  entry_academic_year_id: Joi.number().required(),
  programme_id: Joi.number().required(),
  campus_id: Joi.number().required(),
  intake_id: Joi.number().required(),
  category: Joi.string().required(),
  narration: Joi.string(),
  students: Joi.array().items(Joi.number()).required(),
});

const provisionalGradListAcademicYearSchema = Joi.object({
  graduation_academic_year_id: Joi.number().required(),
});

const pushToGraduationListSchema = Joi.object({
  provisional_list_ids: Joi.array().items(Joi.number()).required(),
});

const graduateStudentsSchema = Joi.object({
  graduation_list_ids: Joi.array().items(Joi.number()).required(),
  graduation_date: Joi.date().required(),
  graduation_congregation_number: Joi.number().required(),
  graduation_year: Joi.string().optional(),
  completion_year: Joi.string().required(),
});

const generateSenateReportSchema = Joi.object({
  campus_id: Joi.number().required(),
  intake_id: Joi.number().required(),
  programme_id: Joi.number().required(),
  academic_year_id: Joi.number().required(),
  study_year_id: Joi.number().required(),
  semester_id: Joi.number().required(),
});

const updateGraduationListAcademicYearSchema = Joi.object({
  academic_year_id: Joi.number().optional().allow(null),
  programme_id: Joi.number().optional().allow(null),
  provisional_graduation_list_ids: Joi.array().items(Joi.number()).required(),
});

const updateFinalGraduationListSchema = Joi.object({
  programme_id: Joi.number().required(),
  graduation_list_ids: Joi.array().items(Joi.number()).required(),
});

const billStudentsOnGraduationListSchema = Joi.object({
  graduation_list_ids: Joi.array().items(Joi.number()).required(),
});

module.exports = {
  administrativeProvisionalGradListSchema,
  pushToProvisionalSchema,
  provisionalGradListAcademicYearSchema,
  graduateStudentsSchema,
  generateSenateReportSchema,
  pushToGraduationListSchema,
  updateGraduationListAcademicYearSchema,
  updateFinalGraduationListSchema,
  billStudentsOnGraduationListSchema,
};
