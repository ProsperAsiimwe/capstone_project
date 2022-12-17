const express = require('express');
const {
  ReportsUniPayController,
  SearchTransactionsController,
  // ReportsChartOfAccountsController,
  ReportsAccountController,
  DownLoadReportsController,
  ItsDataController,
} = require('@controllers/UniversalPayments');
const reportsRouter = express.Router();

const controller = new ReportsUniPayController();
const searchController = new SearchTransactionsController();
// const accountController = new ReportsChartOfAccountsController();
const chartAccountController = new ReportsAccountController();
const downloadReports = new DownLoadReportsController();
const itsController = new ItsDataController();

// report
reportsRouter.get('/', controller.reportsUniPayFunction);
// summary report

reportsRouter.get('/summary', controller.summaryReport);

// monthlyCollection
reportsRouter.get('/month-collections', controller.monthlyCollection);

reportsRouter.post('/download-report', controller.downloadDetailedReport);

// SearchTransactionsController

reportsRouter.get(
  '/search-transactions',
  searchController.searchTransactionsFunction
);

// studentTuitionLedger
reportsRouter.get('/student-ledger', searchController.studentTuitionLedger);

reportsRouter.get('/ledger', searchController.studentLedgerFunction);

//  studentFinancialStatement

reportsRouter.get(
  '/financial-statement',
  searchController.studentFinancialStatement
);

// itsController

reportsRouter.get('/its-statements', itsController.itsFinancialStatement);

reportsRouter.post(
  '/pdf-financial-statement',
  searchController.pdfStudentFinancialStatement
);

// pdfItsFinancialStatement
reportsRouter.post(
  '/pdf-its-statement',
  itsController.pdfItsFinancialStatement
);

// studentPrepaymentApproval

reportsRouter.get('/prepayments', searchController.studentPrepaymentApproval);
//  quarterlyAndAnnuallyReport

reportsRouter.get(
  '/quarterly-annually',
  chartAccountController.quarterlyAndAnnuallyReport
);

// quarterlyFinancialReport

reportsRouter.get(
  '/quarterly-report',
  chartAccountController.quarterlyFinancialReport
);

// chart of account report

reportsRouter.get(
  '/account-report',
  chartAccountController.chartAccountReportFunction
);

// revenuePerItemReport
reportsRouter.get(
  '/revenue-item-report',
  chartAccountController.revenuePerItemReport
);
// graduationRevenueReport
reportsRouter.get(
  '/global-payment-revenue',
  chartAccountController.globalPaymentRevenueReport
);

// accountReportByBillingDate
reportsRouter.get(
  '/account-by-date',
  chartAccountController.accountReportByBillingDate
);

reportsRouter.get(
  '/account-student',
  chartAccountController.studentAccountPayment
);

reportsRouter.get(
  '/account-details',
  chartAccountController.accountReportFunction
);

reportsRouter.get(
  '/sponsor-payments',
  chartAccountController.sponsorAnnualReportFunction
);
// sponsorAllocationsReport
reportsRouter.get(
  '/allocation-report',
  chartAccountController.sponsorAllocationsReport
);

reportsRouter.post(
  '/download-all-details',
  downloadReports.downloadAllUniversalPayments
);

module.exports = reportsRouter;
