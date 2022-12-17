const Joi = require('joi');

// Define the payment reference other fees invoices object's format expected
const paymentReferenceOtherFeesInvoices = Joi.object().keys({
  other_fees_invoice_id: Joi.number().required(),
  amount: Joi.number().required(),
});

const paymentReferenceManualInvoices = Joi.object().keys({
  manual_invoice_id: Joi.number().required(),
  amount: Joi.number().required(),
});

const paymentReferenceTuitionInvoices = Joi.object().keys({
  tuition_invoice_id: Joi.number().required(),
  amount: Joi.number().required(),
});

const paymentReferenceFunctionalInvoices = Joi.object().keys({
  functional_fees_invoice_id: Joi.number().required(),
  amount: Joi.number().required(),
});

const createPaymentReferenceByStudentSchema = Joi.object({
  payment_mode: Joi.string(),
  tax_payer_bank_code: Joi.string(),
  payment_bank_code: Joi.string(),
  payment_mobile_no: Joi.string(),
  functional_fees_invoice_id: Joi.number(),
  functional_fees_amount: Joi.number(),
  tuition_invoices: Joi.array().items(paymentReferenceTuitionInvoices),
  other_fees_invoices: Joi.array().items(paymentReferenceOtherFeesInvoices),
  manual_invoices: Joi.array().items(paymentReferenceManualInvoices),
});

const createPaymentReferenceByStaffSchema = Joi.object({
  student_id: Joi.number().required(),
  payment_mode: Joi.string(),
  tax_payer_bank_code: Joi.string(),
  payment_bank_code: Joi.string(),
  payment_mobile_no: Joi.string(),
  functional_fees_invoice_id: Joi.number(),
  functional_fees_amount: Joi.number(),
  tuition_invoices: Joi.array().items(paymentReferenceTuitionInvoices),
  other_fees_invoices: Joi.array().items(paymentReferenceOtherFeesInvoices),
  manual_invoices: Joi.array().items(paymentReferenceManualInvoices),
});

const allUnpaidInvoicesSchema = Joi.object({
  payment_mode: Joi.string(),
  tax_payer_bank_code: Joi.string(),
  payment_bank_code: Joi.string(),
  payment_mobile_no: Joi.string(),
});

const createPaymentReferenceForSomeOfTheUnpaidInvoicesSchema = Joi.object({
  payment_mode: Joi.string(),
  tax_payer_bank_code: Joi.string(),
  payment_bank_code: Joi.string(),
  payment_mobile_no: Joi.string(),
  tuition_invoices: Joi.array().items(paymentReferenceTuitionInvoices),
  functional_fees_invoices: Joi.array().items(
    paymentReferenceFunctionalInvoices
  ),
  other_fees_invoices: Joi.array().items(paymentReferenceOtherFeesInvoices),
  manual_invoices: Joi.array().items(paymentReferenceManualInvoices),
});

const createPaymentReferenceForFuturePaymentsSchema = Joi.object({
  payment_mode: Joi.string(),
  tax_payer_bank_code: Joi.string(),
  payment_bank_code: Joi.string(),
  payment_mobile_no: Joi.string(),
  amount: Joi.number().required(),
});

const updatePaymentReferenceSchema = Joi.object({
  student_id: Joi.number(),
  reference_origin: Joi.string(),
  generated_by: Joi.string(),
  functional_fees_invoice_id: Joi.number(),
  functional_fees_amount: Joi.number(),
  tuition_invoice_id: Joi.number(),
  tuition_fees_amount: Joi.number(),
  // This is an array of payment reference other fees invoices
  other_fees_invoices: Joi.array().items(paymentReferenceOtherFeesInvoices),
  manual_invoices: Joi.array().items(paymentReferenceManualInvoices),
});

module.exports = {
  createPaymentReferenceByStudentSchema,
  createPaymentReferenceByStaffSchema,
  updatePaymentReferenceSchema,
  createPaymentReferenceForSomeOfTheUnpaidInvoicesSchema,
  createPaymentReferenceForFuturePaymentsSchema,
  allUnpaidInvoicesSchema,
};
