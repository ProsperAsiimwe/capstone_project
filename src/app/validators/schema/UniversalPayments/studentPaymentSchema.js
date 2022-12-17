const Joi = require('joi');

const createStudentPaymentSchema = Joi.object({
  student_number: Joi.string().required(),
  payment_mode: Joi.string(),
  full_name: Joi.string().required(),
  email: Joi.string().required(),
  phone_number: Joi.string().required(),
  description: Joi.string().required(),
  amount: Joi.number().required(),
  tax_payer_bank_code: Joi.string(),
  payment_bank_code: Joi.string(),
  payment_mobile_no: Joi.string(),
});

const createStudentPaymentTransactionsSchema = Joi.object({
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

module.exports = {
  createStudentPaymentSchema,
  createStudentPaymentTransactionsSchema,
};
