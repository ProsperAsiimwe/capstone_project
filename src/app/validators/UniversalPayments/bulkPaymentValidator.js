const { JoiValidator } = require('@middleware');
const { bulkPaymentSchema } = require('../schema/UniversalPayments');

const validateCreateBulkPayment = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    bulkPaymentSchema.createBulkPaymentSchema
  );
};

module.exports = {
  validateCreateBulkPayment,
};
