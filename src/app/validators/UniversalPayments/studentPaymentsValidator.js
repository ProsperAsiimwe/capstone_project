const { JoiValidator } = require('@middleware');
const { studentPaymentSchema } = require('../schema/UniversalPayments');

const validateCreateStudentPayment = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    studentPaymentSchema.createStudentPaymentSchema
  );
};

const validateCreateStudentPaymentTransactions = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    studentPaymentSchema.createStudentPaymentTransactionsSchema
  );
};

module.exports = {
  validateCreateStudentPayment,
  validateCreateStudentPaymentTransactions,
};
