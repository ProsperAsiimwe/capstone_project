const { JoiValidator } = require('@middleware');
const {
  paymentTransactionSchema,
} = require('../schema/EnrollmentAndRegistration');

const validateCreateBankPaymentTransaction = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    paymentTransactionSchema.createBankPaymentTransactionSchema
  );
};
const validateCreateDirectPaymentTransaction = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    paymentTransactionSchema.createDirectPaymentTransactionSchema
  );
};

const validateUpdatePaymentTransaction = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    paymentTransactionSchema.updatePaymentTransactionSchema
  );
};

const validateApprovePaymentTransaction = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    paymentTransactionSchema.approvePaymentTransactionSchema
  );
};

const validateAllocateMoneyToInvoices = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    paymentTransactionSchema.allocateMoneyToInvoicesSchema
  );
};

const validateRefundRequest = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    paymentTransactionSchema.refundRequestSchema
  );
};

const validateApproveRefundRequest = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    paymentTransactionSchema.approveRefundRequestSchema
  );
};

module.exports = {
  validateCreateBankPaymentTransaction,
  validateCreateDirectPaymentTransaction,
  validateUpdatePaymentTransaction,
  validateAllocateMoneyToInvoices,
  validateApprovePaymentTransaction,
  validateRefundRequest,
  validateApproveRefundRequest,
};
