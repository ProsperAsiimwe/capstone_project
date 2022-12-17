const Joi = require('joi');

const arrayOfInvoiceObjects = Joi.object().keys({
  id: Joi.number().required(),
  invoice_number: Joi.string().required(),
  allocated_amount: Joi.number().required(),
});

const createBankPaymentTransactionSchema = Joi.object({
  reference_number: Joi.string().required(),
  payment_mode: Joi.string().required(),
  amount_paid: Joi.number().required(),
  bank_name: Joi.string().required(),
  bank_branch: Joi.string(),
  currency: Joi.string(),
  mode_reference: Joi.string(),
  payment_date: Joi.date().required(),
});

const createDirectPaymentTransactionSchema = Joi.object({
  student_id: Joi.number().required(),
  academic_year_id: Joi.number().required(),
  semester_id: Joi.number().required(),
  study_year_id: Joi.number().required(),
  payment_mode: Joi.string().required(),
  currency: Joi.string().required(),
  amount_paid: Joi.number().required(),
  bank_name: Joi.string().required(),
  bank_branch: Joi.string().required(),
  mode_reference: Joi.string().required(),
  narration: Joi.string().required(),
  payment_date: Joi.date().required(),
});

const updatePaymentTransactionSchema = Joi.object({
  student_id: Joi.number(),
  academic_year_id: Joi.number(),
  semester_id: Joi.number(),
  study_year_id: Joi.number(),
  payment_mode: Joi.string(),
  currency: Joi.string(),
  amount_paid: Joi.number(),
  bank_name: Joi.string(),
  bank_branch: Joi.string(),
  mode_reference: Joi.string(),
  payment_date: Joi.date(),
});

const allocateMoneyToInvoicesSchema = Joi.object({
  student_id: Joi.number().required(),
  invoices: Joi.array().items(arrayOfInvoiceObjects).required(),
});

const approvePaymentTransactionSchema = Joi.object({
  payment_transactions: Joi.array().required(),
});

const refundRequestSchema = Joi.object({
  reason: Joi.string().required(),
  requested_by: Joi.string().required(),
});

const approveRefundRequestSchema = Joi.object({
  student_id: Joi.number().required(),
  comment: Joi.string().required(),
});

module.exports = {
  createBankPaymentTransactionSchema,
  createDirectPaymentTransactionSchema,
  updatePaymentTransactionSchema,
  allocateMoneyToInvoicesSchema,
  approvePaymentTransactionSchema,
  refundRequestSchema,
  approveRefundRequestSchema,
};
