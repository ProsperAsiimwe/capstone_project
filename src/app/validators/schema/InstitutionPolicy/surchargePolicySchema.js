const Joi = require('joi');

const policyEntryYears = Joi.object().keys({
  entry_academic_year_id: Joi.number().required(),
  duration: Joi.number().required(),
});

const createSurchargePolicySchema = Joi.object({
  surcharge_type_id: Joi.number().required(),
  other_fees_element_id: Joi.number().required(),
  is_active: Joi.boolean().required(),
  duration_measure_id: Joi.number(),
  apply_to_entry_years: Joi.boolean(),
  policy_entry_years: Joi.array().items(policyEntryYears),
  duration: Joi.number(),
});

const updateSurchargePolicySchema = Joi.object({
  surcharge_type_id: Joi.number(),
  other_fees_element_id: Joi.number(),
  is_active: Joi.boolean(),
  duration_measure_id: Joi.number(),
  apply_to_entry_years: Joi.boolean(),
  policy_entry_years: Joi.array().items(policyEntryYears),
  duration: Joi.number(),
});

const revokeSurchargeInvoiceSchema = Joi.object({
  approval_remarks: Joi.string().required(),
});

const requestRevokeSurchargeInvoiceSchema = Joi.object({
  surcharge_type_id: Joi.number().required(),
  enrollment_event_id: Joi.number().required(),
  student_id: Joi.number(),
  reason: Joi.string().required(),
});

module.exports = {
  createSurchargePolicySchema,
  updateSurchargePolicySchema,
  revokeSurchargeInvoiceSchema,
  requestRevokeSurchargeInvoiceSchema,
};
