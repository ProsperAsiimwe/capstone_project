const Joi = require('joi');

// const oLevelSummary = Joi.object().keys({
//   aggregate: Joi.number().required(),
//   division: Joi.number().required(),
// });

const oLevelSubjects = Joi.object().keys({
  name: Joi.string().required(),
  code: Joi.string().required(),
  result: Joi.string().required(),
  interpretation: Joi.number().required(),
});

const createApplicantOLevelDataSchema = Joi.object({
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
  subjects: Joi.array().items(oLevelSubjects),
  examYear: Joi.number(),
  sat_o_level_exams: Joi.bool(),
  is_manual: Joi.bool(),
});

const updateApplicantOLevelDataSchema = Joi.object({
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
  subjects: Joi.array().items(oLevelSubjects),
  examYear: Joi.number(),
  sat_o_level_exams: Joi.bool(),
  is_manual: Joi.bool(),
  o_level_data_id: Joi.number().required(),
});

const updateApplicantOLevelDataByStaffSchema = Joi.object({
  running_admission_id: Joi.number(),
  form_id: Joi.string(),
  status: Joi.number(),
  name: Joi.string(),
  photo: Joi.string(),
  school_name: Joi.string(),
  index_number: Joi.string(),
  center_no: Joi.string(),
  summary: Joi.object(),
  subjects: Joi.array().items(oLevelSubjects),
  exam_year: Joi.number(),
  sat_o_level_exams: Joi.bool(),
  is_manual: Joi.bool(),
});

module.exports = {
  createApplicantOLevelDataSchema,
  updateApplicantOLevelDataSchema,
  updateApplicantOLevelDataByStaffSchema,
};
