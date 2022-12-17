const express = require('express');
const {
  InvoiceController,
  CreditNoteController,
  DebitNoteController,
} = require('@controllers/EnrollmentAndRegistration');
const { invoiceValidator } = require('@validators/EnrollmentAndRegistration');

const invoiceRouter = express.Router();
const controller = new InvoiceController();
const creditNoteController = new CreditNoteController();
const debitNoteController = new DebitNoteController();

// invoiceRouter.post(
//   '/other-fees-invoice',
//   [invoiceValidator.validateCreateOtherFeesInvoiceByStaff],
//   controller.createOtherFeesInvoiceByStaff
// );

invoiceRouter.post(
  '/manual-invoice',
  [invoiceValidator.validateCreateManualInvoiceByStaff],
  controller.createManualInvoiceByStaff
);

invoiceRouter.post(
  '/bulk-manual-invoice',
  [invoiceValidator.validateCreateBulkManualInvoiceByStaff],
  controller.createBulkManualInvoiceByStaff
);

invoiceRouter.post(
  '/bulk-internship-invoice',
  controller.createBulkInternshipBillInvoiceByStaff
);

invoiceRouter.post(
  '/download-bulk-manual-invoice-template',
  controller.downloadBulkManualInvoiceTemplate
);

invoiceRouter.post(
  '/upload-bulk-manual-invoice-template',
  controller.uploadBulkManualInvoiceTemplate
);

invoiceRouter.get(
  '/all-invoices/:student_id',
  controller.fetchAllInvoicesByStaff
);

invoiceRouter.get(
  '/show-unpaid-invoices/:student_id',
  controller.showAllUnpaidInvoices
);

invoiceRouter.post(
  '/allocate-money-to-invoice/:invoice_id',
  [invoiceValidator.validateAllocateMoneyToInvoice],
  controller.allocateMoneyToInvoice
);

invoiceRouter.get(
  '/tuition-invoice-elements/:tuition_invoice_id',
  controller.fetchTuitionInvoiceFeesElements
);
invoiceRouter.get(
  '/functional-invoice-elements/:functional_invoice_id',
  controller.fetchFunctionalInvoiceFeesElements
);
invoiceRouter.get(
  '/other-fees-invoice-elements/:other_fees_invoice_id',
  controller.fetchOtherFeesInvoiceFeesElements
);
invoiceRouter.get(
  '/manual-invoice-elements/:manual_invoice_id',
  controller.fetchManualInvoiceFeesElements
);

invoiceRouter.get(
  '/fetch-all-voided-invoices/:student_id',
  controller.fetchAllVoidedInvoices
);
invoiceRouter.get(
  '/pending-exempted-invoices',
  controller.fetchAllInvoiceExemptionRequestsForAllStudents
);
invoiceRouter.get(
  '/fetch-student-invoice-exemption-requests/:student_id',
  controller.fetchAllInvoiceExemptionRequestsForOneStudent
);
invoiceRouter.post(
  '/request-to-void-invoice/:student_id',
  [invoiceValidator.validateVoidingInvoice],
  controller.requestVoidInvoices
);
invoiceRouter.get(
  '/fetch-requests-to-void-invoices',
  controller.fetchRequestsToVoidInvoices
);
invoiceRouter.post(
  '/approve-pending-voided-invoices',
  [invoiceValidator.validateApproveVoidingInvoice],
  controller.approveVoidInvoices
);
invoiceRouter.post(
  '/reject-pending-voided-invoices',
  [invoiceValidator.validateRejectVoidingInvoice],
  controller.rejectVoidInvoices
);
invoiceRouter.post(
  '/de-allocate-invoices/:student_id',
  [invoiceValidator.validateDeAllocateInvoice],
  controller.deAllocateInvoices
);
invoiceRouter.post(
  '/request-to-exempt-invoices/:student_id',
  [invoiceValidator.validateRequestToExemptInvoices],
  controller.requestToExemptInvoices
);
invoiceRouter.post(
  '/exempt-invoices/:student_id',
  [invoiceValidator.validateExemptInvoice],
  controller.exemptInvoices
);

// APPLY CREDIT NOTES
invoiceRouter.get(
  '/credit-notes/bulk-pending',
  creditNoteController.getBulkPendingCreditNotes
);

// by date range pendingNotesByDate

invoiceRouter.get(
  '/credit-notes/notes-by-range',
  creditNoteController.pendingNotesByDate
);

invoiceRouter.get(
  '/credit-notes/report',
  creditNoteController.creditNoteReportsDate
);

invoiceRouter.get(
  '/credit-notes/all-pending/:studentId',
  creditNoteController.getPendingCreditNotes
);
invoiceRouter.get(
  '/credit-notes/all-approved',
  creditNoteController.getAllApproved
);
invoiceRouter.get(
  '/credit-notes/student-approved/:student_id',
  creditNoteController.getAllStudentApproved
);
invoiceRouter.get(
  '/credit-notes/:invoice_number',
  creditNoteController.getInvoiceCreditNotes
);
invoiceRouter.put(
  '/credit-notes/approve',
  [invoiceValidator.validateApproveCreditNote],
  creditNoteController.approveCreditNote
);
invoiceRouter.put(
  '/credit-notes/decline',
  [invoiceValidator.validateApproveCreditNote],
  creditNoteController.declineCreditNotes
);
invoiceRouter.post(
  '/credit-notes/:student_id',
  [invoiceValidator.validateCreateCreditNote],
  creditNoteController.createCreditNote
);

// APPLY DEBIT NOTES
invoiceRouter.get(
  '/debit-notes/bulk-pending',
  debitNoteController.getBulkPendingDebitNotes
);

invoiceRouter.get(
  '/debit-notes/all-pending/:studentId',
  debitNoteController.getPendingDebitNotes
);
invoiceRouter.get(
  '/debit-notes/all-approved',
  debitNoteController.getAllApproved
);
invoiceRouter.get(
  '/debit-notes/student-approved/:student_id',
  debitNoteController.getAllStudentApproved
);
invoiceRouter.get(
  '/debit-notes/:invoice_number',
  debitNoteController.getInvoiceDebitNotes
);
invoiceRouter.put(
  '/debit-notes/approve',
  [invoiceValidator.validateApproveDebitNote],
  debitNoteController.approveDebitNote
);
invoiceRouter.put(
  '/debit-notes/decline',
  [invoiceValidator.validateApproveDebitNote],
  debitNoteController.declineDebitNotes
);
invoiceRouter.post(
  '/debit-notes/:student_id',
  [invoiceValidator.validateCreateDebitNote],
  debitNoteController.createDebitNote
);

module.exports = invoiceRouter;
