const enrollmentValidator = require('./enrollmentValidator');
const invoiceValidator = require('./invoiceValidator');
const paymentReferencesValidator = require('./paymentReferencesValidator');
const registrationValidator = require('./registrationValidator');
const paymentTransactionValidator = require('./paymentTransactionValidator');
const fundsTransferValidator = require('./fundsTransferValidator');

module.exports = {
  enrollmentValidator,
  invoiceValidator,
  paymentReferencesValidator,
  registrationValidator,
  paymentTransactionValidator,
  fundsTransferValidator,
};
