const ChartOfAccount = require('./chartOfAccount.model');
const AccountReceivable = require('./accountReceivable.model');
const ReceivableApproval = require('./receivableApproval.model');
const UniversalInvoice = require('./universalInvoice.model');
const UniversalInvoiceReceivable = require('./universalInvoiceReceivable.model');
const UniversalInvoicePaymentReference = require('./universalInvoicePaymentReference.model');
const UniversalInvoicePaymentTransactions = require('./universalInvoicePaymentTransactions.model');
const BulkPayment = require('./bulkPayment.model');
const SystemPrnTracker = require('./systemPrnTracker.model');
const BulkPaymentStudent = require('./bulkPaymentStudent.model');
const Sponsor = require('./sponsor.model');
const SponsorStudent = require('./sponsorStudent.model');
const PreviousStudentDeposit = require('./previousStudentDeposit.model');
const PreviousStudentPayment = require('./previousStudentPayment.model');
const PreviousUniversalPayment = require('./previousUniversalPayment.model');
const StudentPayment = require('./studentPayment.model');
const StudentPaymentReference = require('./studentPaymentReference.model');
const StudentPaymentTransaction = require('./studentPaymentTransaction.model');
const SponsorInvoice = require('./sponsorInvoice.model');
const SponsorPaymentReference = require('./sponsorPaymentReference.model');
const SponsorTransaction = require('./sponsorTransaction.model');
const SponsorAllocation = require('./sponsorAllocation.model');

module.exports = {
  ChartOfAccount,
  AccountReceivable,
  ReceivableApproval,
  UniversalInvoice,
  UniversalInvoiceReceivable,
  UniversalInvoicePaymentReference,
  UniversalInvoicePaymentTransactions,
  BulkPayment,
  SystemPrnTracker,
  BulkPaymentStudent,
  Sponsor,
  SponsorStudent,
  PreviousStudentDeposit,
  PreviousStudentPayment,
  PreviousUniversalPayment,
  StudentPayment,
  StudentPaymentReference,
  StudentPaymentTransaction,
  SponsorInvoice,
  SponsorPaymentReference,
  SponsorTransaction,
  SponsorAllocation,
};
