const feesElementValidator = require('./feesElementValidator');
const feesWaiverValidator = require('./feesWaiverValidator');
const feesWaiverDiscountValidator = require('./feesWaiverDiscountValidator');
const tuitionAmountValidator = require('./tuitionAmountValidator');
const functionalFeesAmountValidator = require('./functionalFeesAmountValidator');
const otherFeesAmountValidator = require('./otherFeesAmountValidator');
const feesCopyValidator = require('./feesCopyValidator');
const exemptedTuitionCampusValidator = require('./exemptedTuitionCampusValidator');
const graduationFeesValidator = require('./graduationFeesValidator');

module.exports = {
  feesElementValidator,
  feesWaiverValidator,
  feesWaiverDiscountValidator,
  tuitionAmountValidator,
  functionalFeesAmountValidator,
  otherFeesAmountValidator,
  feesCopyValidator,
  exemptedTuitionCampusValidator,
  graduationFeesValidator,
};
