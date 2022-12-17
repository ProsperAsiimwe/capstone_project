// sponsorAnnualReport
const { sumBy } = require('lodash');
const { reportsChartOfAccountService } = require('@services/index');

/**
 *
 * @param {*} context
 * @returns
 */
const sponsorAnnualReport = async function (context) {
  if (!context.contextYear && context.contextYear > 2019) {
    throw new Error(`Invalid Context Provided or year greater than 2019`);
  }

  const result = await reportsChartOfAccountService.sponsorAnnualReport(
    context
  );

  const total = sumBy(result, 'amount');
  const totalAllocated = sumBy(result, 'allocated_amount');
  const totalUnallocated = sumBy(result, 'unallocated_amount');

  const data = { total, totalAllocated, totalUnallocated, result };

  return data;
};

module.exports = {
  sponsorAnnualReport,
};
