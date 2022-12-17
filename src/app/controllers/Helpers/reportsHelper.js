const {
  isEmpty,
  sumBy,
  uniq,
  map,
  toUpper,
  forEach,
  find,
  orderBy,
  toString,
} = require('lodash');
const {
  reportsChartOfAccountService,
  reportsUniPayService,
  institutionStructureService,
  invoiceService,
  chartOfAccountService,
  metadataService,
  changeOfProgrammeService,
  paymentTransactionService,
  reportsAccountService,
} = require('@services/index');
const PDFDocument = require('pdfkit-table');
const fs = require('fs');
const path = require('path');
const { appConfig } = require('../../../config');
const moment = require('moment');
const { checkDateRange } = require('../../helpers/dateRangeHelper');
const { getMetadataValueIdFromName } = require('./programmeHelper');

/**
 *
 * @param {*} context
 * @returns
 */
const summaryChartOfAccountReport = async function (context) {
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

  const invoiceStatus = await metadataService.findOneMetadata({
    where: {
      metadata_name: 'INVOICE STATUSES',
    },
    include: [
      {
        association: 'metadataValues',
        attributes: ['id', 'metadata_value', 'metadata_id'],
      },
    ],
    attributes: ['id', 'metadata_name'],
    plain: true,
    nest: true,
  });

  const activeStatusId = getMetadataValueIdFromName(
    invoiceStatus.metadataValues,
    'ACTIVE',
    'INVOICE STATUSES'
  );

  if (!activeStatusId)
    throw new Error('Invoice status ACTIVE is Not Defined in the system');

  const chartOfAccounts = await chartOfAccountService
    .findAllChartsOfAccount({
      attributes: ['id', 'account_code', 'account_name'],
      include: [
        {
          association: 'feesElements',
          attributes: ['id'],
        },
        {
          association: 'receivables',
          attributes: ['id'],
        },
      ],
    })
    .then((res) => {
      if (res) {
        return res.map((item) => item.get({ plain: true }));
      }
    });

  const uniPay = await reportsChartOfAccountService.chartAccountReport(context);
  const copReport = await changeOfProgrammeService.getChangeOfProgrammeReport(
    context.payments_from,
    context.payments_to
  );

  const queryData = {
    category: 'tuition',
    start_date: context.payments_from,
    end_date: context.payments_to,
    invoice_status_id: activeStatusId,
  };

  const tuitionInvoices = await invoiceService.getStudentInvoicesByDate(
    queryData
  );

  const functionalInvoices = await invoiceService.getStudentInvoicesByDate({
    ...queryData,
    category: 'functional',
  });

  const manualInvoices = await invoiceService.getStudentInvoicesByDate({
    ...queryData,
    category: 'manual',
  });

  const otherFeesInvoices = await invoiceService.getStudentInvoicesByDate({
    ...queryData,
    category: 'other',
  });

  const applications =
    await reportsChartOfAccountService.chartAccountApplicationReport(context);

  // feesDepositsAccount ...
  const feesDeposits = await reportsChartOfAccountService.feesDepositsAccount(
    context
  );

  // SPONSOR PAYMENTS
  const sponsorData = await reportsChartOfAccountService.sponsorAccountReport(
    context
  );

  const transactions =
    await paymentTransactionService.getDirectPostAndPreviousPaymentAmounts(
      context.payments_from,
      context.payments_to
    );

  const findDirectPost = find(
    transactions,
    (trxn) => trxn.transaction_origin === 'DIRECT POST'
  );
  const findPrevious = find(
    transactions,
    (trxn) => trxn.transaction_origin === 'PREVIOUS STUDENT DEPOSIT'
  );
  const fundTransfer = find(
    transactions,
    (trxn) => trxn.transaction_origin === 'FUNDS TRANSFER'
  );

  const totalDirectPosts = findDirectPost ? findDirectPost.total_amount : 0;
  const totalPreviousPayments = findPrevious ? findPrevious.total_amount : 0;
  const totalFundsTransferred = fundTransfer ? fundTransfer.total_amount : 0;

  const defaultReport = map(chartOfAccounts, (element) => {
    return {
      ...element,
      amount_billed: 0,
      amount_received: 0,
      exempted_amount: 0,
    };
  });

  let chartOfAccountReport = defaultReport;

  // TUITION FEE PAYMENTS
  const tuitionReport = generateInvoiceReports(
    tuitionInvoices,
    chartOfAccountReport,
    defaultReport
  );

  // FUNCTIONAL FEE PAYMENTS
  const functionalReport = generateInvoiceReports(
    functionalInvoices,
    tuitionReport.newAccountReport,
    defaultReport
  );

  // MANUAL INVOICE PAYMENTS
  const manualReport = generateInvoiceReports(
    manualInvoices,
    functionalReport.newAccountReport,
    defaultReport
  );

  // OTHER INVOICE PAYMENTS
  const otherReport = generateInvoiceReports(
    otherFeesInvoices,
    manualReport.newAccountReport,
    defaultReport
  );

  chartOfAccountReport = otherReport.newAccountReport;

  // UNIVERSAL PAYMENTS
  const universalReport = mapOtherElements(
    uniPay,
    chartOfAccountReport,
    defaultReport
  );
  const applicationReport = mapOtherElements(
    applications,
    universalReport.newAccountReport,
    defaultReport
  );

  const changeOfProgrammes = mapChangeOfProgrammes(
    copReport,
    applicationReport.newAccountReport,
    defaultReport
  );

  chartOfAccountReport = changeOfProgrammes.newAccountReport;

  const totalAmountUnallocated =
    sponsorData.unallocated_amount + feesDeposits.unallocated_amount;

  const allInvoices = [
    ...tuitionInvoices,
    ...functionalInvoices,
    manualInvoices,
    otherFeesInvoices,
  ];

  const totalCreditNotes = sumBy(allInvoices, 'credit_note') || 0;
  const totalDebitNotes = sumBy(allInvoices, 'debit_note') || 0;

  const data = {
    totalAmountUnallocated,
    feesDeposits,
    sponsorData,
    chartOfAccountReport,
    totalDirectPosts,
    totalPreviousPayments,
    totalFundsTransferred,
    totalDebitNotes,
    totalCreditNotes,
    totalAmountBilled: sumBy(chartOfAccountReport, 'amount_billed'),
    totalAmountReceived: sumBy(chartOfAccountReport, 'amount_received'),
    totalTuitionBilled: sumBy(tuitionInvoices, 'invoice_amount'),
    totalTuitionPaid: sumBy(tuitionInvoices, 'amount_paid'),
    totalFunctionalBilled: sumBy(functionalInvoices, 'invoice_amount'),
    totalFunctionalPaid: sumBy(functionalInvoices, 'amount_paid'),
    totalManualBilled: sumBy(manualInvoices, 'invoice_amount'),
    totalManualPaid: sumBy(manualInvoices, 'amount_paid'),
    totalOthersBilled: sumBy(otherFeesInvoices, 'invoice_amount'),
    totalOthersPaid: sumBy(otherFeesInvoices, 'amount_paid'),
    tuitionReport: tuitionReport.newDefaultReport,
    functionalReport: functionalReport.newDefaultReport,
    manualReport: manualReport.newDefaultReport,
    otherReport: otherReport.newDefaultReport,
    universalReport: universalReport.newDefaultReport,
    applicationReport: applicationReport.newDefaultReport,
    changeOfProgrammes: changeOfProgrammes.newDefaultReport,
  };

  return data;
};

/**
 * GET REVENUE PER ITEM REPORT FOR PAYMENTS
 *
 * @param {*} context
 * @returns
 */
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

  const invoiceStatus = await metadataService.findOneMetadata({
    where: {
      metadata_name: 'INVOICE STATUSES',
    },
    include: [
      {
        association: 'metadataValues',
        attributes: ['id', 'metadata_value', 'metadata_id'],
      },
    ],
    attributes: ['id', 'metadata_name'],
    plain: true,
    nest: true,
  });

  const activeStatusId = getMetadataValueIdFromName(
    invoiceStatus.metadataValues,
    'ACTIVE',
    'INVOICE STATUSES'
  );

  if (!activeStatusId)
    throw new Error('Invoice status ACTIVE is Not Defined in the system');

  const chartOfAccounts = await chartOfAccountService
    .findAllChartsOfAccount({
      attributes: ['id', 'account_code', 'account_name'],
      include: [
        {
          association: 'feesElements',
          attributes: ['id'],
        },
        {
          association: 'receivables',
          attributes: ['id'],
        },
      ],
    })
    .then((res) => {
      if (res) {
        return res.map((item) => item.get({ plain: true }));
      }
    });

  const uniPay = await reportsChartOfAccountService.chartAccountReport(context);
  const copReport = await changeOfProgrammeService.getChangeOfProgrammeReport(
    context.payments_from,
    context.payments_to
  );

  // const queryData = {
  //   category: 'tuition',
  //   start_date: context.payments_from,
  //   end_date: context.payments_to,
  //   invoice_status_id: activeStatusId,
  // };

  // const tuitionInvoices = await invoiceService.getStudentInvoicesByDate(
  //   queryData
  // );

  // const functionalInvoices = await invoiceService.getStudentInvoicesByDate({
  //   ...queryData,
  //   category: 'functional',
  // });

  // const manualInvoices = await invoiceService.getStudentInvoicesByDate({
  //   ...queryData,
  //   category: 'manual',
  // });

  // const otherFeesInvoices = await invoiceService.getStudentInvoicesByDate({
  //   ...queryData,
  //   category: 'other',
  // });

  const applications =
    await reportsChartOfAccountService.chartAccountApplicationReport(context);

  // feesDepositsAccount ...
  const feesDeposits = await reportsChartOfAccountService.feesDepositsAccount(
    context
  );

  // SPONSOR PAYMENTS
  const sponsorData = await reportsChartOfAccountService.sponsorAccountReport(
    context
  );

  const transactions =
    await paymentTransactionService.getDirectPostAndPreviousPaymentAmounts(
      context.payments_from,
      context.payments_to
    );

  const findDirectPost = find(
    transactions,
    (trxn) => trxn.transaction_origin === 'DIRECT POST'
  );
  const findPrevious = find(
    transactions,
    (trxn) => trxn.transaction_origin === 'PREVIOUS STUDENT DEPOSIT'
  );
  const fundTransfer = find(
    transactions,
    (trxn) => trxn.transaction_origin === 'FUNDS TRANSFER'
  );

  const totalDirectPosts = findDirectPost ? findDirectPost.total_amount : 0;
  const totalPreviousPayments = findPrevious ? findPrevious.total_amount : 0;
  const totalFundsTransferred = fundTransfer ? fundTransfer.total_amount : 0;

  const defaultReport = map(chartOfAccounts, (element) => {
    return {
      ...element,
      amount_billed: 0,
      amount_received: 0,
      exempted_amount: 0,
    };
  });

  let chartOfAccountReport = defaultReport;

  // // TUITION FEE PAYMENTS
  // const tuitionReport = generateInvoiceReports(
  //   tuitionInvoices,
  //   chartOfAccountReport,
  //   defaultReport
  // );

  // // FUNCTIONAL FEE PAYMENTS
  // const functionalReport = generateInvoiceReports(
  //   functionalInvoices,
  //   tuitionReport.newAccountReport,
  //   defaultReport
  // );

  // // MANUAL INVOICE PAYMENTS
  // const manualReport = generateInvoiceReports(
  //   manualInvoices,
  //   functionalReport.newAccountReport,
  //   defaultReport
  // );

  // // OTHER INVOICE PAYMENTS
  // const otherReport = generateInvoiceReports(
  //   otherFeesInvoices,
  //   manualReport.newAccountReport,
  //   defaultReport
  // );

  // chartOfAccountReport = otherReport.newAccountReport;

  // UNIVERSAL PAYMENTS
  const universalReport = mapOtherElements(
    uniPay,
    chartOfAccountReport,
    defaultReport
  );
  const applicationReport = mapOtherElements(
    applications,
    universalReport.newAccountReport,
    defaultReport
  );

  const changeOfProgrammes = mapChangeOfProgrammes(
    copReport,
    applicationReport.newAccountReport,
    defaultReport
  );

  chartOfAccountReport = changeOfProgrammes.newAccountReport;

  const totalAmountUnallocated =
    sponsorData.unallocated_amount + feesDeposits.unallocated_amount;

  // const allInvoices = [
  //   ...tuitionInvoices,
  //   ...functionalInvoices,
  //   manualInvoices,
  //   otherFeesInvoices,
  // ];

  // const totalCreditNotes = sumBy(allInvoices, 'credit_note') || 0;
  // const totalDebitNotes = sumBy(allInvoices, 'debit_note') || 0;

  const data = {
    totalAmountUnallocated,
    feesDeposits,
    sponsorData,
    chartOfAccountReport,
    totalDirectPosts,
    totalPreviousPayments,
    totalFundsTransferred,
    // totalDebitNotes,
    // totalCreditNotes,
    totalAmountBilled: sumBy(chartOfAccountReport, 'amount_billed'),
    totalAmountReceived: sumBy(chartOfAccountReport, 'amount_received'),
    // totalTuitionBilled: sumBy(tuitionInvoices, 'invoice_amount'),
    // totalTuitionPaid: sumBy(tuitionInvoices, 'amount_paid'),
    // totalFunctionalBilled: sumBy(functionalInvoices, 'invoice_amount'),
    // totalFunctionalPaid: sumBy(functionalInvoices, 'amount_paid'),
    // totalManualBilled: sumBy(manualInvoices, 'invoice_amount'),
    // totalManualPaid: sumBy(manualInvoices, 'amount_paid'),
    // totalOthersBilled: sumBy(otherFeesInvoices, 'invoice_amount'),
    // totalOthersPaid: sumBy(otherFeesInvoices, 'amount_paid'),
    // tuitionReport: tuitionReport.newDefaultReport,
    // functionalReport: functionalReport.newDefaultReport,
    // manualReport: manualReport.newDefaultReport,
    // otherReport: otherReport.newDefaultReport,
    universalReport: universalReport.newDefaultReport,
    applicationReport: applicationReport.newDefaultReport,
    changeOfProgrammes: changeOfProgrammes.newDefaultReport,
  };

  return data;
};

const generateInvoiceReports = (
  invoices,
  accountReports = [],
  defaultReport = []
) => {
  let newAccountReport = accountReports;

  let newDefaultReport = defaultReport;

  forEach(invoices, (invoice) => {
    let availableBalance = invoice.amount_paid;
    // + invoice.exempted_amount;

    forEach(invoice.fees_elements, (feesEle) => {
      let amountPaid = 0;
      const amountBilled = feesEle.amount;

      if (availableBalance >= amountBilled) {
        amountPaid = amountBilled;
        availableBalance = availableBalance - amountBilled;
      } else {
        amountPaid = availableBalance;
        availableBalance = amountBilled - availableBalance;
      }

      newAccountReport = map(newAccountReport, (account) => {
        let returnData = account;

        if (toString(account.id) === toString(feesEle.account_id)) {
          returnData = {
            ...account,
            exempted_amount: account.exempted_amount + invoice.exempted_amount,
            amount_billed: account.amount_billed + amountBilled,
            amount_received: account.amount_received + amountPaid,
          };
        }

        return returnData;
      });

      newDefaultReport = map(newDefaultReport, (account) => {
        let returnData = account;

        if (toString(account.id) === toString(feesEle.account_id)) {
          returnData = {
            ...account,
            amount_billed: account.amount_billed + amountBilled,
            amount_received: account.amount_received + amountPaid,
          };
        }

        return returnData;
      });
    });
  });

  return {
    newAccountReport: orderBy(newAccountReport, 'amount_received', 'desc'),
    newDefaultReport: orderBy(
      newDefaultReport,
      'amount_received',
      'desc'
    ).filter((v) => v.amount_received !== 0),
  };
};

const mapOtherElements = (
  feesElements,
  accountReport = [],
  defaultReport = []
) => {
  let newAccountReport = accountReport;

  let newDefaultReport = defaultReport;

  forEach(feesElements, (element) => {
    newAccountReport = map(newAccountReport, (account) => {
      let returnData = account;

      if (element.account_id === account.id)
        returnData = {
          ...account,
          amount_billed: account.amount_billed + element.total_amount,
          amount_received: account.amount_received + element.total_amount,
        };

      return returnData;
    });

    newDefaultReport = map(newDefaultReport, (account) => {
      let returnData = account;

      if (element.account_id === account.id)
        returnData = {
          ...account,
          amount_billed: account.amount_billed + element.total_amount,
          amount_received: account.amount_received + element.total_amount,
        };

      return returnData;
    });
  });

  return {
    newAccountReport: orderBy(newAccountReport, 'amount_received', 'desc'),
    newDefaultReport: orderBy(
      newDefaultReport,
      'amount_received',
      'desc'
    ).filter((v) => v.amount_received !== 0),
  };
};

const mapChangeOfProgrammes = (
  copReport,
  accountReport = [],
  defaultReport = []
) => {
  let newAccountReport = accountReport;

  let newDefaultReport = defaultReport;

  forEach(copReport, (element) => {
    newAccountReport = map(newAccountReport, (account) => {
      let returnData = account;

      if (element.account_id === account.id)
        returnData = {
          ...account,
          amount_billed:
            account.amount_billed +
            sumBy(element.change_of_programmes, 'amount_billed'),
          amount_received:
            account.amount_received +
            sumBy(element.change_of_programmes, 'amount_received'),
        };

      return returnData;
    });

    newDefaultReport = map(newDefaultReport, (account) => {
      let returnData = account;

      if (element.account_id === account.id)
        returnData = {
          ...account,
          amount_billed:
            account.amount_billed +
            sumBy(element.change_of_programmes, 'amount_billed'),
          amount_received:
            account.amount_received +
            sumBy(element.change_of_programmes, 'amount_received'),
        };

      return returnData;
    });
  });

  return {
    newAccountReport: orderBy(newAccountReport, 'amount_received', 'desc'),
    newDefaultReport: orderBy(
      newDefaultReport,
      'amount_received',
      'desc'
    ).filter((v) => v.amount_received !== 0),
  };
};

// accountReportByBillingDate
const accountReportByBillingDate = async function (context) {
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

  const uniPay = await reportsAccountService.universalAccountReport(context);

  const studentAccount = await reportsAccountService.tuitionPaymentReport(
    context
  );

  const applications =
    await reportsAccountService.chartAccountApplicationReport(context);

  //  feesDepositsAccount ...

  const feesDeposits = await reportsChartOfAccountService.feesDepositsAccount(
    context
  );

  const sponsorData = await reportsChartOfAccountService.sponsorAccountReport(
    context
  );

  const resultData = [...uniPay, ...studentAccount, ...applications].map(
    (e) => ({
      ...e,
      amount: parseInt(e.amount, 10),
    })
  );

  let data = {};

  if (isEmpty(resultData)) {
    data = { totalAmount: 0, resultData: [] };
  } else {
    const totalAmount = sumBy(resultData, 'amount');

    const totalAmountUnallocated =
      sponsorData.unallocated_amount + feesDeposits.unallocated_amount;

    data = {
      totalAmount,
      totalAmountUnallocated,
      feesDeposits,
      sponsorData,
      resultData,
    };
  }

  return data;
};

/**
 *
 * @param {*} context
 * @returns
 */
const handleChartOfAccountReport = async function (context) {
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

  let data = {};

  if (context.transaction_category === 'UNIVERSAL') {
    const uniPay = await reportsChartOfAccountService.universalPay(context);

    const studentDetails =
      await reportsChartOfAccountService.studentItemDetails(context);

    const result = [...studentDetails, ...uniPay];

    if (isEmpty(result)) {
      data = { totalAmount: 0, result: [] };
    } else {
      const totalAmount = sumBy(result, 'receivable_amount');

      const payers = uniq(map(result, 'email')).length;

      data = { totalAmount, payers, result };
    }
  } else {
    const uniPay = await reportsChartOfAccountService.universalPay(context);

    const studentDetails =
      await reportsChartOfAccountService.studentItemDetails(context);

    const result = [...studentDetails, ...uniPay];

    if (isEmpty(result)) {
      data = { totalAmount: 0, result: [] };
    } else {
      const totalAmount = sumBy(result, 'receivable_amount');

      const payers = uniq(map(result, 'email')).length;

      data = { totalAmount, payers, result };
    }
  }

  return data;
};

/**
 *
 * @param {*} context
 * @returns
 *
 */
const handleAllTransactionReports = async function (context) {
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

  let data = {};

  if (
    context.transaction_category === 'UNIVERSAL' &&
    context.report_category === 'SUMMARY'
  ) {
    data = await reportsUniPayService.universalPaymentSummary(context);

    Object.keys(data).forEach(function (key) {
      if (data[key] === null) {
        data[key] = 0;
      }
    });
  } else if (
    context.transaction_category === 'UNIVERSAL' &&
    context.report_category === 'DETAILED'
  ) {
    data = await reportsUniPayService.universalPaymentsDetailed(context);
  } else if (
    context.transaction_category === 'APPLICANT' &&
    context.report_category === 'DETAILED'
  ) {
    data = await reportsUniPayService.applicantPaymentsReport(context);
  } else if (
    context.transaction_category === 'APPLICANT' &&
    context.report_category === 'SUMMARY'
  ) {
    data = await reportsUniPayService.applicantPaymentsSummary(context);

    Object.keys(data).forEach(function (key) {
      if (data[key] === null) {
        data[key] = 0;
      }
    });
  } else if (
    context.transaction_category === 'BULK' &&
    context.report_category === 'DETAILED'
  ) {
    data = await reportsUniPayService.bulkPaymentsReport(context);
  } else if (
    context.transaction_category === 'BULK' &&
    context.report_category === 'SUMMARY'
  ) {
    data = await reportsUniPayService.bulkPaymentsSummary(context);

    Object.keys(data).forEach(function (key) {
      if (data[key] === null) {
        data[key] = 0;
      }
    });
  } else if (
    context.transaction_category === 'STUDENT' &&
    context.report_category === 'DETAILED'
  ) {
    data = await reportsUniPayService.studentsPaymentsReport(context);
  } else if (
    context.transaction_category === 'STUDENT' &&
    context.report_category === 'SUMMARY'
  ) {
    data = await reportsUniPayService.studentsPaymentsSummary(context);

    Object.keys(data).forEach(function (key) {
      if (data[key] === null) {
        data[key] = 0;
      }
    });
  } else if (
    context.transaction_category === 'ALL' &&
    context.report_category === 'SUMMARY'
  ) {
    const students = await reportsUniPayService.studentsPaymentsSummary(
      context
    );

    // const changeOfProgramme =
    //   await changeOfProgrammeService.getChangeOfProgrammeReport(
    //     context.payments_from > context.payments_to
    //   );

    Object.keys(students).forEach(function (key) {
      if (students[key] === null) {
        students[key] = 0;
      }
    });
    const bulk = await reportsUniPayService.bulkPaymentsSummary(context);

    Object.keys(bulk).forEach(function (key) {
      if (bulk[key] === null) {
        bulk[key] = 0;
      }
    });
    const applicant = await reportsUniPayService.applicantPaymentsSummary(
      context
    );

    Object.keys(applicant).forEach(function (key) {
      if (applicant[key] === null) {
        applicant[key] = 0;
      }
    });

    const universal = await reportsUniPayService.universalPaymentSummary(
      context
    );

    Object.keys(universal).forEach(function (key) {
      if (universal[key] === null) {
        universal[key] = 0;
      }
    });

    const total =
      universal.total_amount +
      applicant.total_amount +
      bulk.total_amount +
      students.total_amount;

    data = { students, bulk, applicant, universal, total };
  } else if (
    context.transaction_category === 'ALL' &&
    context.report_category === 'DETAILED'
  ) {
    const student = await reportsUniPayService.studentsPaymentsReport(context);

    const universalPay = await reportsUniPayService.universalPaymentsDetailed(
      context
    );

    const applicant = await reportsUniPayService.applicantPaymentsReport(
      context
    );

    const bulk = await reportsUniPayService.bulkPaymentsReport(context);

    data = [...student, ...universalPay, ...applicant, ...bulk];
  } else {
    throw new Error('Invalid Context Provided');
  }

  return data;
};

/**
 *
 * @param {*} user
 * @param {*} data
 * @param {*} context
 * @returns
 */
const downloadDetailedAccountReportPDF = async (user, data, context) => {
  try {
    const structure =
      await institutionStructureService.findInstitutionStructureRecords({
        attributes: [
          'id',
          'institution_name',
          'institution_address',
          'institution_slogan',
          'institution_website',
          'institution_logo',
          'institution_email',
          'telephone_1',
          'telephone_2',
          'academic_units',
        ],
        raw: true,
      });

    if (!structure) {
      throw new Error(`Unable To Get Institution Structure Records.`);
    }

    const logoDirectory = path.join(appConfig.ASSETS_ROOT_DIRECTORY, 'logo');

    let institutionLogo = `${logoDirectory}/${structure.institution_logo}`;

    if (!fs.existsSync(institutionLogo)) {
      institutionLogo = `${logoDirectory}/default.png`;
      if (!fs.existsSync(institutionLogo)) institutionLogo = null;
    }

    // Create a document
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
        throw new Error(err.message);
      });
    }

    // Pipe its output somewhere, like to a file or HTTP response
    const stream = doc.pipe(
      fs.createWriteStream(
        `${path.join(
          appConfig.ASSETS_ROOT_DIRECTORY,
          `documents/templates`
        )}/ACCOUNT-TRANSACTIONS-SUMMARY-REPORT.pdf`
      )
    );

    const docPath = `${path.join(
      appConfig.ASSETS_ROOT_DIRECTORY,
      `documents/templates`
    )}/ACCOUNT-TRANSACTIONS-SUMMARY-REPORT.pdf`;

    if (institutionLogo) {
      doc
        .image(`${institutionLogo}`, 280, 10, {
          width: 100,
          align: 'center',
        })
        .moveDown();
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor('black')
      .moveDown()
      .text(`${structure.institution_name} `, 100, 140, {
        align: 'center',
      })
      .moveDown()
      .text('OFFICE OF THE BURSAR', 100, 160, {
        align: 'center',
      })
      .moveDown()
      .text('Account Transactions Summary Report', 100, 180, {
        align: 'center',
      })
      .moveDown()
      .fillColor('gray')
      .text(
        `From  ${moment(context.payments_from).format(
          'MMM Do YYYY'
        )} To ${moment(context.payments_to).format('MMM Do YYYY')}`,
        100,
        200,
        {
          align: 'center',
        }
      )
      .moveDown()
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(
        `TOTAL AMOUNT: ${parseInt(
          data.totalAmountReceived,
          10
        ).toLocaleString()} UGX `,
        100,
        220,
        {
          align: 'center',
        }
      )
      .fillColor('black')
      .moveDown();

    const accountsTable = {
      title: 'Table',
      headers: [
        {
          label: '#',
          property: 'number',
          width: 20,
          renderer: null,
        },
        {
          label: 'A/C CODE',
          property: 'code',
          width: 60,
          renderer: null,
        },
        {
          label: 'ACCOUNT NAME',
          property: 'name',
          width: 200,
          renderer: null,
        },
        {
          label: 'TOTAL BILLED',
          property: 'amount',
          width: 100,
          renderer: null,
        },
        {
          label: 'TOTAL COLLECTED',
          property: 'amount',
          width: 100,
          renderer: null,
        },
      ],
      rows: [],
    };

    const reportCategories = [
      {
        title: 'SUMMARY COLLECTIONS',
        key: 'chartOfAccountReport',
      },
      {
        title: 'TUITION INVOICE COLLECTIONS',
        key: 'tuitionReport',
      },
      {
        title: 'FUNCTIONAL INVOICE COLLECTIONS',
        key: 'functionalReport',
      },
      {
        title: 'MANUAL INVOICE COLLECTIONS',
        key: 'manualReport',
      },
      {
        title: 'OTHER INVOICE COLLECTIONS',
        key: 'otherReport',
      },
      {
        title: 'UNIVERSAL PAYMENT COLLECTIONS',
        key: 'universalReport',
      },
      {
        title: 'APPLICATION FEE COLLECTIONS',
        key: 'applicationReport',
      },
      {
        title: 'CHANGE OF PROGRAMME COLLECTIONS',
        key: 'changeOfProgrammes',
      },
    ];

    forEach(reportCategories, (category) => {
      accountsTable.rows.push(['', '', category.title]);

      forEach(data[category.key], (item, index) => {
        accountsTable.rows.push([
          index + 1,
          item.account_code,
          item.account_name,
          parseInt(item.amount_billed, 10).toLocaleString(),
          parseInt(item.amount_received, 10).toLocaleString(),
        ]);
      });

      accountsTable.rows.push(['']);
      accountsTable.rows.push(['']);
    });

    // draw the table
    doc.table(accountsTable, {
      columnSpacing: 6,
      outerWidth: 800,
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
      prepareRow: (row, indexColumn, indexRow, rectRow) => {
        doc.font('Helvetica').fontSize(8);
        indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15);
      },
    });

    // Finalize The PDF and End The Stream
    doc.end();

    return {
      stream: stream,
      docPath: docPath,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// bankStudentPaymentsReport

const bankPaymentsReport = async function (context) {
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

  let data = [];

  // const bankDetails = {
  //   BOA: 'Bank Of Africa',
  //   BOB: 'Bank Of Baroda',
  //   BRC: 'Barclays Bank',
  //   CBA: 'COMMERCIAL BANK OF AFRICA UGANDA LIMITED',
  //   CIB: 'Cairo International Bank',
  //   CNB: 'Centenary Bank',
  //   CTB: 'Citibank',
  //   DFC: 'Dfcu Bank',
  //   DTB: 'Diamond Trust Bank',
  //   ECO: 'Eco Bank',
  //   EQB: 'Equity Bank Uganda Limited',
  //   IBL: 'Exim Bank Uganda Limited',
  //   FTB: 'Finance Trust Bank Limited',
  //   GNB: 'Guaranty Trust Bank Uganda Limited',
  //   HFB: 'Housing Finance Bank',
  //   KCB: 'KCB Bank Uganda',
  //   NCB: 'NC Bank Uganda Limited',
  //   ORN: 'Orient Bank',
  //   PBU: 'Post Bank Uganda Limited',
  //   STN: 'Stanbic',
  //   SCB: 'Standard Chartered',
  //   TAB: 'Tropical Bank Ltd',
  //   UBA: 'United Bank For Africa',
  // };

  if (
    context.transaction_category === 'UNIVERSAL' &&
    context.report_category === 'BANK'
  ) {
    data = await reportsUniPayService.bankUniversalPaymentsReport(context);

    Object.keys(data).forEach(function (key) {
      if (data[key] === null) {
        data[key] = 0;
      }
    });
  } else if (
    context.transaction_category === 'APPLICANT' &&
    context.report_category === 'BANK'
  ) {
    data = await reportsUniPayService.bankApplicantPaymentsReport(context);

    Object.keys(data).forEach(function (key) {
      if (data[key] === null) {
        data[key] = 0;
      }
    });
  } else if (
    context.transaction_category === 'BULK' &&
    context.report_category === 'BANK'
  ) {
    data = await reportsUniPayService.bankBulkyPaymentsReport(context);

    Object.keys(data).forEach(function (key) {
      if (data[key] === null) {
        data[key] = 0;
      }
    });
  } else if (
    context.transaction_category === 'STUDENT' &&
    context.report_category === 'BANK'
  ) {
    data = await reportsUniPayService.bankStudentPaymentsReport(context);

    Object.keys(data).forEach(function (key) {
      if (data[key] === null) {
        data[key] = 0;
      }
    });
  } else if (
    context.transaction_category === 'ALL' &&
    context.report_category === 'BANK'
  ) {
    const universal = await reportsUniPayService.bankUniversalPaymentsReport(
      context
    );

    universal.forEach((element) => {
      for (const key in element) {
        if (element[key] == null) element[key] = 0;
      }
    });

    const students = await reportsUniPayService.bankStudentPaymentsReport(
      context
    );

    students.forEach((element) => {
      if (element.bank === null) {
        element.bank = 'NOT DEFINED';
      }
    });

    const bulk = await reportsUniPayService.bankBulkyPaymentsReport(context);

    Object.keys(bulk).forEach(function (key) {
      if (bulk[key] === null) {
        bulk[key] = 0;
      }
    });

    const applicant = await reportsUniPayService.bankApplicantPaymentsReport(
      context
    );

    Object.keys(applicant).forEach(function (key) {
      if (applicant[key] === null) {
        applicant[key] = 0;
      }
    });
    const mergedArray = [...universal, ...applicant, ...students, ...bulk];

    const total = sumBy(mergedArray, 'total_amount');

    const bankPayments = [
      ...mergedArray
        .reduce((r, o) => {
          const key = o.bank;

          const item =
            r.get(key) ||
            Object.assign({}, o, {
              total_amount: 0,
            });

          item.total_amount += Number(o.total_amount);

          return r.set(key, item);
        }, new Map())
        .values(),
    ];

    data = {
      bankPayments: map(bankPayments, (r) => {
        return {
          bank: r.bank,
          total_amount: r.total_amount,
        };
      }),
      students,
      bulk,
      applicant,
      universal,
      total,
    };
  }

  return data;
};

const academicUnitDatePayments = async function (context) {
  if (context.payments_from > context.payments_to) {
    throw new Error(
      `Invalid Context Provided, 'PAYMENT FROM DATE' SHOULD BE LESS OR EQUAL  TO 'PAYMENT TO DATE'`
    );
  }

  let data = [];

  let result = [];

  let otherFees = [];

  let manual = [];

  const institutionStructure =
    await institutionStructureService.findInstitutionStructureRecords();

  const institutionStructureUpper = institutionStructure.academic_units.map(
    (e) => toUpper(e)
  );

  if (
    institutionStructure &&
    institutionStructureUpper
      .map((element) => element.includes('COL'))
      .includes(true)
  ) {
    const tuition = await reportsUniPayService.collegeDatePaymentsReport(
      context
    );
    const functional = await reportsUniPayService.collegeFunctionalPayments(
      context
    );

    otherFees = await reportsUniPayService.collegeOtherPayments(context);

    manual = await reportsUniPayService.collegeManualPayments(context);

    result = [...tuition, ...functional, ...otherFees, ...manual];

    const academicUnitPayments = [
      ...result
        .reduce((r, o) => {
          const key = o.academic_unit_code;

          const item =
            r.get(key) ||
            Object.assign({}, o, {
              amount: 0,
            });

          item.amount += Number(o.amount);

          return r.set(key, item);
        }, new Map())
        .values(),
    ];

    data = {
      summary: academicUnitPayments,
      tuition,
      functional,
      otherFees,
      manual,
    };
  } else if (
    institutionStructure &&
    (institutionStructureUpper
      .map((element) => element.includes('FAC'))
      .includes(true) ||
      institutionStructureUpper
        .map((element) => element.includes('SCH'))
        .includes(true))
  ) {
    const tuition = await reportsUniPayService.facultyDatePaymentsReport(
      context
    );
    const functional = await reportsUniPayService.facultyFunctionalPayments(
      context
    );

    otherFees = await reportsUniPayService.facultyOtherPayments(context);

    manual = await reportsUniPayService.facultyManualPayments(context);

    result = [...tuition, ...functional, ...otherFees, ...manual];

    const academicUnitPayments = [
      ...result
        .reduce((r, o) => {
          const key = o.academic_unit_code;

          const item =
            r.get(key) ||
            Object.assign({}, o, {
              amount: 0,
            });

          item.amount += Number(o.amount);

          return r.set(key, item);
        }, new Map())
        .values(),
    ];

    data = {
      summary: academicUnitPayments,
      tuition,
      functional,
      otherFees,
      manual,
    };
  } else {
    const tuition = await reportsUniPayService.facultyDatePaymentsReport(
      context
    );
    const functional = await reportsUniPayService.facultyFunctionalPayments(
      context
    );

    otherFees = await reportsUniPayService.facultyOtherPayments(context);

    manual = await reportsUniPayService.facultyManualPayments(context);

    result = [...tuition, ...functional, ...otherFees, ...manual];

    const academicUnitPayments = [
      ...result
        .reduce((r, o) => {
          const key = o.academic_unit_code;

          const item =
            r.get(key) ||
            Object.assign({}, o, {
              amount: 0,
            });

          item.amount += Number(o.amount);

          return r.set(key, item);
        }, new Map())
        .values(),
    ];

    data = {
      summary: academicUnitPayments,
      tuition,
      functional,
      otherFees,
      manual,
    };
  }

  return data;
};

module.exports = {
  summaryChartOfAccountReport,
  handleChartOfAccountReport,
  revenuePerItemReport,
  handleAllTransactionReports,
  downloadDetailedAccountReportPDF,
  bankPaymentsReport,
  academicUnitDatePayments,
  accountReportByBillingDate,
};
