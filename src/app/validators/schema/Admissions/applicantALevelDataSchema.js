const Joi = require('joi');

const aLevelSubjects = Joi.object().keys({
  name: Joi.string().required(),
  code: Joi.string().required(),
  result: Joi.string().required(),
  interpretation: Joi.number().required(),
});

const createApplicantALevelDataSchema = Joi.object({
  running_admission_id: Joi.number().required(),
  section_id: Joi.number().required(),
  form_id: Joi.string(),
  status: Joi.number(),
  name: Joi.string(),
  photo: Joi.string(),
  school_name: Joi.string(),
  indexNumber: Joi.string(),
  indexNo: Joi.string(),
  centerNo: Joi.string(),
  summary: Joi.object(),
  subjects: Joi.array().items(aLevelSubjects),
  examYear: Joi.number(),
  sat_a_level_exams: Joi.bool(),
  is_manual: Joi.bool(),
});

const updateApplicantALevelDataSchema = Joi.object({
  running_admission_id: Joi.number(),
  section_id: Joi.number(),
  form_id: Joi.string(),
  status: Joi.number(),
  name: Joi.string(),
  photo: Joi.string(),
  school_name: Joi.string(),
  indexNumber: Joi.string(),
  indexNo: Joi.string(),
  centerNo: Joi.string(),
  summary: Joi.object(),
  subjects: Joi.array().items(aLevelSubjects),
  examYear: Joi.number(),
  sat_a_level_exams: Joi.bool(),
  is_manual: Joi.bool(),
  a_level_data_id: Joi.number().required(),
});

const updateApplicantALevelDataByStaffSchema = Joi.object({
  running_admission_id: Joi.number(),
  form_id: Joi.string(),
  status: Joi.number(),
  name: Joi.string(),
  photo: Joi.string(),
  school_name: Joi.string(),
  index_number: Joi.string(),
  center_no: Joi.string(),
  summary: Joi.object(),
  subjects: Joi.array().items(aLevelSubjects),
  exam_year: Joi.number(),
  sat_a_level_exams: Joi.bool(),
  is_manual: Joi.bool(),
});

module.exports = {
  createApplicantALevelDataSchema,
  updateApplicantALevelDataSchema,
  updateApplicantALevelDataByStaffSchema,
};
