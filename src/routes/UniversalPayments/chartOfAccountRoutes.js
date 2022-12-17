const express = require('express');
const {
  ChartOfAccountController,
  UniversalInvoiceController,
  DownLoadReportsController,
} = require('@controllers/UniversalPayments');
const { chartOfAccountValidator } = require('@validators/UniversalPayments');

const chartOfAccountRouter = express.Router();
const controller = new ChartOfAccountController();
const invoiceController = new UniversalInvoiceController();
const downloadController = new DownLoadReportsController();

chartOfAccountRouter.get('/', controller.index);

chartOfAccountRouter.get(
  '/fetch-universal-transactions',
  invoiceController.fetchAllUniversalInvoiceTransactions
);

chartOfAccountRouter.post(
  '/',
  [chartOfAccountValidator.validateCreateChartOfAccount],
  controller.createAccount
);

chartOfAccountRouter.post(
  '/download-upload-template',
  controller.downloadChartOfAccountsTemplate
);

chartOfAccountRouter.post(
  '/download-summary-report-pdf',
  controller.downloadChartOfAccountsSummaryPdf
);
chartOfAccountRouter.post(
  '/download-summary',
  downloadController.downloadSummaryAccount
);

chartOfAccountRouter.post(
  '/download-report',
  controller.downloadAccountReportTemplate
);

chartOfAccountRouter.post(
  '/upload-accounts',
  controller.uploadChartOfAccountsTemplate
);

chartOfAccountRouter.post(
  '/approve-account',
  [chartOfAccountValidator.validateApproveAccountReceivable],
  controller.approveAccountReceivables
);

chartOfAccountRouter.put(
  '/:id',
  [chartOfAccountValidator.validateCreateChartOfAccount],
  controller.updateAccount
);

chartOfAccountRouter.delete('/:id', controller.deleteChartOfAccount);

module.exports = chartOfAccountRouter;
