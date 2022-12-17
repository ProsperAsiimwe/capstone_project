const Joi = require('joi');

const universalInvoiceReceivables = Joi.object().keys({
  receivable_id: Joi.number().required(),
  quantity: Joi.number().required(),
});

const previousDeposits = Joi.object().keys({
  deposit_id: Joi.number().required(),
  amount: Joi.number().required(),
});

const createUniversalInvoiceSchema = Joi.object({
  payment_mode: Joi.string(),
  tax_payer_bank_code: Joi.string(),
  payment_bank_code: Joi.string(),
  payment_mobile_no: Joi.string(),
  former_student_identifier: Joi.string().empty(''),
  full_name: Joi.string().required(),
  email: Joi.string().required().email(),
  phone_number: Joi.string().required(),
  description: Joi.string(),
  currency_id: Joi.number(),
  receivables: Joi.array().items(universalInvoiceReceivables).required(),
});

const universalInvoiceReceivablesOnStaffPortal = Joi.object().keys({
  receivable_id: Joi.number().required(),
  amount_due: Joi.number().required(),
});

const createUniversalInvoiceByStaffSchema = Joi.object({
  former_student_identifier: Joi.string().empty(''),
  full_name: Joi.string().required(),
  email: Joi.string().required(),
  phone_number: Joi.string().required(),
  description: Joi.string().required(),
  currency_id: Joi.number().required(),
  receivables: Joi.array()
    .items(universalInvoiceReceivablesOnStaffPortal)
    .required(),
});

const createUniversalInvoicePaymentTransactionsSchema = Joi.object({
  ura_prn: Joi.string().required(),
  amount: Joi.number().required(),
  payment_mode: Joi.string(),
  bank: Joi.string(),
  branch: Joi.string(),
  banktxnid: Joi.string(),
  currency: Joi.string(),
  signature: Joi.string(),
  payment_date: Joi.date().required(),
  narration: Joi.string(),
});

const createPushToStudentAccountSchema = Joi.object({
  // previous_deposits: Joi.array().items(Joi.number()).required(),
  requests: Joi.array().items(previousDeposits).required(),
});

const createPushToPrepaymentsSchema = Joi.object({
  requests: Joi.array().items(previousDeposits).required(),
  studentNumber: Joi.number().required(),
});

const deletePreviousPaymentsSchema = Joi.object({
  data_to_delete: Joi.array().items(Joi.number()).required(),
});

module.exports = {
  createUniversalInvoiceSchema,
  createUniversalInvoiceByStaffSchema,
  createUniversalInvoicePaymentTransactionsSchema,
  createPushToStudentAccountSchema,
  createPushToPrepaymentsSchema,
  deletePreviousPaymentsSchema,
};
