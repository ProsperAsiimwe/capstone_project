const { JoiValidator } = require('@middleware');
const {
  paymentReferenceSchema,
} = require('../schema/EnrollmentAndRegistration');

const validateCreatePaymentReferenceByStudent = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    paymentReferenceSchema.createPaymentReferenceByStudentSchema
  );
};
const validateCreatePaymentReferenceByStaff = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    paymentReferenceSchema.createPaymentReferenceByStaffSchema
  );
};
const validateUpdatePaymentReference = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    paymentReferenceSchema.updatePaymentReferenceSchema
  );
};
const validateCreatePaymentReferenceForSomeOfTheUnpaidInvoices = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    paymentReferenceSchema.createPaymentReferenceForSomeOfTheUnpaidInvoicesSchema
  );
};

const validateCreatePaymentReferenceForFuturePayments = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    paymentReferenceSchema.createPaymentReferenceForFuturePaymentsSchema
  );
};

const validateAllUnpaidInvoices = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    paymentReferenceSchema.allUnpaidInvoicesSchema
  );
};

module.exports = {
  validateCreatePaymentReferenceByStudent,
  validateCreatePaymentReferenceByStaff,
  validateUpdatePaymentReference,
  validateCreatePaymentReferenceForSomeOfTheUnpaidInvoices,
  validateCreatePaymentReferenceForFuturePayments,
  validateAllUnpaidInvoices,
};
