const { JoiValidator } = require('@middleware');
const { invoiceSchema } = require('../schema/EnrollmentAndRegistration');

const validateCreateOtherFeesInvoiceByStaff = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    invoiceSchema.createOtherFeesInvoiceByStaffSchema
  );
};
const validateCreateOtherFeesInvoiceByStudent = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    invoiceSchema.createOtherFeesInvoiceByStudentSchema
  );
};
const validateCreateManualInvoiceByStaff = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    invoiceSchema.createManualInvoiceByStaffSchema
  );
};
const validateCreateBulkManualInvoiceByStaff = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    invoiceSchema.createBulkManualInvoiceByStaffSchema
  );
};

const validateAllocateMoneyToInvoice = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    invoiceSchema.allocateMoneyToAnInvoiceSchema
  );
};

const validateAllocateMoneyToInvoiceByStudent = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    invoiceSchema.allocateMoneyToAnInvoiceByStudentSchema
  );
};

const validateAllocateMoneyToOneInvoiceByStudent = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    invoiceSchema.allocateMoneyToOneInvoiceByStudentSchema
  );
};

const validateUpdateInvoice = async (req, res, next) => {
  return await JoiValidator(req, res, next, invoiceSchema.updateInvoiceSchema);
};

const validateVoidingInvoice = async (req, res, next) => {
  return await JoiValidator(req, res, next, invoiceSchema.voidingInvoiceSchema);
};
const validateApproveVoidingInvoice = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    invoiceSchema.approvePendingVoidedInvoiceSchema
  );
};
const validateRejectVoidingInvoice = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    invoiceSchema.rejectPendingVoidedInvoiceSchema
  );
};
const validateDeAllocateInvoice = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    invoiceSchema.deAllocateInvoiceSchema
  );
};
const validateExemptInvoice = async (req, res, next) => {
  return await JoiValidator(req, res, next, invoiceSchema.exemptInvoiceSchema);
};
const validateRequestToExemptInvoices = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    invoiceSchema.requestToExemptInvoicesSchema
  );
};

const validateCreateCreditNote = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    invoiceSchema.createCreditNoteSchema
  );
};

const validateCreateDebitNote = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    invoiceSchema.createDebitNoteSchema
  );
};

const validateApproveCreditNote = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    invoiceSchema.approveCreditNoteSchema
  );
};

const validateApproveDebitNote = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    invoiceSchema.approveDebitNoteSchema
  );
};

module.exports = {
  validateCreateOtherFeesInvoiceByStaff,
  validateCreateOtherFeesInvoiceByStudent,
  validateCreateManualInvoiceByStaff,
  validateCreateBulkManualInvoiceByStaff,
  validateUpdateInvoice,
  validateAllocateMoneyToInvoice,
  validateVoidingInvoice,
  validateApproveVoidingInvoice,
  validateDeAllocateInvoice,
  validateExemptInvoice,
  validateCreateCreditNote,
  validateCreateDebitNote,
  validateApproveCreditNote,
  validateApproveDebitNote,
  validateRequestToExemptInvoices,
  validateAllocateMoneyToInvoiceByStudent,
  validateAllocateMoneyToOneInvoiceByStudent,
  validateRejectVoidingInvoice,
};
