const { isEmpty, sumBy } = require('lodash');
const {
  reportsChartOfAccountService,
  reportsAccountService,
} = require('@services/index');
const { checkDateRange } = require('../../helpers/dateRangeHelper');

const revenuePerItemReport = async function (context) {
  if (!context.payments_from || !context.payments_to) {
    throw new Error('Invalid Context Provided');
  }

  if (context.payments_from > context.payments_to) {
    throw new Error(
      `Invalid Context Provided, 'PAYMENT FROM DATE' SHOULD BE LESS OR EQUAL  TO 'PAYMENT TO DATE'`
    );
  }

  const checkRange = checkDateRange(
    context.payments_from,
    context.payments_to,
    'months',
    15
  );

  if (checkRange === false) {
    throw new Error(`Date Range(months) Must be Less than/equal to  15}`);
  }

  const uniPay = await reportsAccountService.uniPayItemReport2(context);

  const applications =
    await reportsAccountService.chartAccountApplicationReport(context);
  const changeProgramme =
    await reportsAccountService.chartAccountChangeProgramme(context);
  const graduationFees = await reportsAccountService.chartAccountGraduationFees(
    context
  );
  const paymentTransactions = await reportsAccountService.paymentRevenueReport(
    context
  );
  const studentAccount = await reportsAccountService.studentInvoicePerItem(
    context
  );

  // const feesDeposits = await reportsChartOfAccountService.feesDepositsAccount(
  //   context
  // );
  const sponsorData = await reportsChartOfAccountService.sponsorAccountReport(
    context
  );

  const resultData = [
    ...uniPay,
    ...studentAccount,
    ...applications,
    ...changeProgramme,
    ...graduationFees,
  ].map((e) => ({
    ...e,
    amount: parseInt(e.amount, 10),
  }));

  const paymentCategories = [
    {
      title: 'Universal Payments',
      data: uniPay,
    },
    {
      title: 'Student Payments',
      data: studentAccount,
    },
    {
      title: 'Application Payments',
      data: applications,
    },
    {
      title: 'Change of Programme Payments',
      data: changeProgramme,
    },
    {
      title: 'Graduation Fee Payments',
      data: graduationFees,
    },
  ];

  let data = {};

  if (isEmpty(resultData)) {
    data = { totalAmount: 0, resultData: [] };
  } else {
    const totalAmount = sumBy(resultData, 'amount');

    const totalAmountUnallocated =
      sponsorData.unallocated_amount +
      paymentTransactions[0].unallocated_amount +
      paymentTransactions[1].unallocated_amount;

    data = {
      note: {
        paymentTransactions: `Transactions made within the selected date range i.e ${paymentTransactions[0].payment_type} and ${paymentTransactions[1].payment_type} `,
        sponsorData: `Sponsor payments made within the selected date range`,
        studentNote: `STUDENT PAYMENTS: All allocation made to invoices fees items for  selected date range, i.e invoice notified payments and allocations from student wallets(Fees deposits, fund transfers and sponsor payments)`,
        universalNote: `Universal payments: All universal (PORTAL) payments based on the selected date range`,
        applicantNote: `Applicant payments: All applicants payments based on the selected date range`,
        ServiceNote: `Service payments: All service payments based on the selected date range e.g change of programmes`,
        GraduationFeesNote: `Graduation Fees payments: All graduation payments based on the selected date range`,
      },
      totalAmount,
      totalAmountUnallocated,
      paymentTransactions,
      sponsorData,
      resultData,
      paymentCategories,
    };
  }

  return data;
};

module.exports = {
  revenuePerItemReport,
};
