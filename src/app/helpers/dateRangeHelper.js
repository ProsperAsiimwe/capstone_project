const moment = require('moment');

const checkDateRange = function (fromDate, toDate, rangeBy, maxDateRange) {
  //   if (fromDate || toDate || maxDateRange || rangeBy) {
  //     throw new Error(`Date Range Error, {system error}`);
  //   }

  try {
    let status = '';

    const yearRange = moment(toDate).year() - moment(fromDate).year();
    const monthRange = moment(toDate).month() - moment(fromDate).month();

    const addRanges = 1 + monthRange + 12 * yearRange;

    if (rangeBy === 'months' && addRanges <= maxDateRange) {
      status = true;
    } else {
      status = false;
      //   throw new Error(
      //     `Date Range(months) Must be Less than/equal to  ${maxDateRange}`
      //   );
    }

    return status;
  } catch (error) {
    throw new Error(`Sorry, we are unable to check the Dates Provided`);
  }
};

module.exports = {
  checkDateRange,
};
