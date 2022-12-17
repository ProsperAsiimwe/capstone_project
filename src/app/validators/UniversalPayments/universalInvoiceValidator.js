const { JoiValidator } = require('@middleware');
const { universalInvoiceSchema } = require('../schema/UniversalPayments');

const validateCreateUniversalInvoice = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    universalInvoiceSchema.createUniversalInvoiceSchema
  );
};

const validateCreateUniversalInvoiceByStaff = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    universalInvoiceSchema.createUniversalInvoiceByStaffSchema
  );
};

const validateCreateUniversalInvoicePaymnetTransactions = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    universalInvoiceSchema.createUniversalInvoicePaymentTransactionsSchema
  );
};

const validatePushToStudentAccount = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    universalInvoiceSchema.createPushToStudentAccountSchema
  );
};

const validatePushToPrepayments = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    universalInvoiceSchema.createPushToPrepaymentsSchema
  );
};

const validateDeletePreviousPayments = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    universalInvoiceSchema.deletePreviousPaymentsSchema
  );
};

module.exports = {
  validateCreateUniversalInvoice,
  validateCreateUniversalInvoiceByStaff,
  validateCreateUniversalInvoicePaymnetTransactions,
  validatePushToStudentAccount,
  validatePushToPrepayments,
  validateDeletePreviousPayments,
};
