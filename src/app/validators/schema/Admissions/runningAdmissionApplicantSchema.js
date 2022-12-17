const Joi = require('joi');

const runningAdmissionApplicants = Joi.object().keys({
  applicant_id: Joi.number().required(),
  form_id: Joi.number().required(),
  programme_id: Joi.number().required(),
});

const createRunningAdmissionApplicantSchema = Joi.object({
  running_admission_id: Joi.number().required(),
  form_section_id: Joi.number().required(),
  payment_method_id: Joi.number().required(),
  payment_status: Joi.string(),
  form_id: Joi.string().required(),
  application_status: Joi.string(),
});

const updateRunningAdmissionApplicantSchema = Joi.object({
  running_admission_id: Joi.number(),
  form_section_id: Joi.number(),
  payment_method_id: Joi.number(),
  payment_status: Joi.string(),
  form_id: Joi.string(),
  application_status: Joi.string(),
  application_completion_date: Joi.date(),
  application_admission_date: Joi.date(),
});

const admitRunningAdmissionApplicantSchema = Joi.object({
  applicants: Joi.array().items(runningAdmissionApplicants).required(),
});

const generatePRNSchema = Joi.object({
  payment_mode: Joi.string(),
  tax_payer_bank_code: Joi.string(),
  payment_bank_code: Joi.string(),
  payment_mobile_no: Joi.string(),
});

module.exports = {
  createRunningAdmissionApplicantSchema,
  updateRunningAdmissionApplicantSchema,
  admitRunningAdmissionApplicantSchema,
  generatePRNSchema,
};
