const Joi = require('joi');

// Define the fees elements structure
const manualInvoiceFeesElements = Joi.object().keys({
  fees_element_id: Joi.number().required(),
  fees_element_description: Joi.string().required(),
  quantity: Joi.number().required(),
  unit_amount: Joi.number().required(),
});

// Define the fees elements structure
const bulkManualInvoiceFeesElements = Joi.object().keys({
  fees_element_id: Joi.number().required(),
  fees_element_description: Joi.string().required(),
  quantity: Joi.number().required(),
});

const paymentTransactionObjects = Joi.object().keys({
  id: Joi.number().required(),
  amount: Joi.number().required(),
});

const invoicesToVoid = Joi.object().keys({
  invoice_id: Joi.number().required(),
  invoice_number: Joi.string().required(),
  reason: Joi.string().required(),
});
const invoicesToApproveVoiding = Joi.object().keys({
  void_request_id: Joi.number().required(),
  invoice_number: Joi.string().required(),
  credit_paid_funds_to_account: Joi.boolean().required(),
});
const invoicesToDeAllocate = Joi.object().keys({
  invoice_id: Joi.number().required(),
  invoice_number: Joi.string().required(),
  de_allocation_comments: Joi.string().required(),
});
const requestedInvoicesToExempt = Joi.object().keys({
  invoice_id: Joi.number().required(),
  invoice_number: Joi.string().required(),
  exempted_amount: Joi.number().required(),
  exemption_comments: Joi.string().required(),
});
const creditNoteElements = Joi.object().keys({
  fees_element_id: Joi.number().required(),
  amount: Joi.number().required(),
});
const debitNoteElements = Joi.object().keys({
  fees_element_id: Joi.number().required(),
  amount: Joi.number().required(),
});

const createOtherFeesInvoiceByStaffSchema = Joi.object({
  student_id: Joi.number().required(),
  academic_year_id: Joi.number().required(),
  semester_id: Joi.number().required(),
  fees_elements: Joi.array().required(),
});
const createOtherFeesInvoiceByStudentSchema = Joi.object({
  enrollment_id: Joi.number().required(),
  fees_elements: Joi.array().required(),
});
const createManualInvoiceByStaffSchema = Joi.object({
  student_id: Joi.number().required(),
  student_programme_id: Joi.number().required(),
  academic_year_id: Joi.number().required(),
  semester_id: Joi.number().required(),
  study_year_id: Joi.number().required(),
  currency: Joi.string().required(),
  description: Joi.string().required(),
  fees_elements: Joi.array().items(manualInvoiceFeesElements).required(),
  due_date: Joi.date(),
  invoice_type_id: Joi.number(),
});

const createBulkManualInvoiceByStaffSchema = Joi.object({
  sponsorship_id: Joi.number().required(),
  campus_id: Joi.any().required(),
  semester_id: Joi.number().required(),
  academic_year_id: Joi.number().required(),
  study_year_id: Joi.number().required(),
  currency: Joi.string().required(),
  description: Joi.string().required(),
  fees_elements: Joi.array().items(bulkManualInvoiceFeesElements).required(),
  due_date: Joi.date().required(),
  invoice_type_id: Joi.number().required(),
  programme_study_level_id: Joi.number().required(),
});

const allocateMoneyToAnInvoiceSchema = Joi.object({
  invoice_number: Joi.string().required(),
  student_id: Joi.number().required(),
  payment_transactions: Joi.array().items(paymentTransactionObjects).required(),
});

const invoiceObjects = Joi.object().keys({
  invoice_id: Joi.number().required(),
  invoice_number: Joi.string().required(),
  amount: Joi.number().required(),
});

const allocateMoneyToAnInvoiceByStudentSchema = Joi.object({
  invoices: Joi.array().items(invoiceObjects).required(),
});

const allocateMoneyToOneInvoiceByStudentSchema = Joi.object({
  invoice_number: Joi.string().required(),
  student_id: Joi.number().required(),
  payment_transactions: Joi.array().items(paymentTransactionObjects).required(),
});

const updateInvoiceSchema = Joi.object({
  amount_paid: Joi.number().required(),
});

const voidingInvoiceSchema = Joi.object({
  invoices: Joi.array().items(invoicesToVoid).required(),
});

const approvePendingVoidedInvoiceSchema = Joi.object({
  invoices: Joi.array().items(invoicesToApproveVoiding).required(),
});

const rejectPendingVoidedInvoiceSchema = Joi.object({
  void_request_id: Joi.number().required(),
  invoice_number: Joi.string().required(),
  approval_remarks: Joi.string().required(),
});

const deAllocateInvoiceSchema = Joi.object({
  invoices: Joi.array().items(invoicesToDeAllocate).required(),
});

const requestToExemptInvoicesSchema = Joi.object({
  invoices: Joi.array().items(requestedInvoicesToExempt).required(),
});

const exemptInvoiceSchema = Joi.object({
  exemption_requests: Joi.array().items(Joi.number()).required(),
});

const createCreditNoteSchema = Joi.object({
  invoice_number: Joi.required(),
  elements: Joi.array().items(creditNoteElements).required(),
  comment: Joi.string().required(),
});

const createDebitNoteSchema = Joi.object({
  invoice_number: Joi.required(),
  elements: Joi.array().items(debitNoteElements).required(),
  comment: Joi.string().required(),
});

const approveCreditNoteSchema = Joi.object({
  credit_notes: Joi.array().items(Joi.number()).required(),
});

const approveDebitNoteSchema = Joi.object({
  debit_notes: Joi.array().items(Joi.number()).required(),
});

module.exports = {
  createOtherFeesInvoiceByStaffSchema,
  createOtherFeesInvoiceByStudentSchema,
  createManualInvoiceByStaffSchema,
  createBulkManualInvoiceByStaffSchema,
  updateInvoiceSchema,
  allocateMoneyToAnInvoiceSchema,
  voidingInvoiceSchema,
  approvePendingVoidedInvoiceSchema,
  deAllocateInvoiceSchema,
  exemptInvoiceSchema,
  createCreditNoteSchema,
  createDebitNoteSchema,
  approveCreditNoteSchema,
  approveDebitNoteSchema,
  requestToExemptInvoicesSchema,
  allocateMoneyToAnInvoiceByStudentSchema,
  allocateMoneyToOneInvoiceByStudentSchema,
  rejectPendingVoidedInvoiceSchema,
};
