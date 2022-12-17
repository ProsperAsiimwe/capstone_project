// FinancialReportController

const express = require('express');
const { FinancialReportController } = require('@controllers/BiReporting');

const financialRoutes = express.Router();

const controller = new FinancialReportController();

financialRoutes.get('/', controller.transactionsReport);
financialRoutes.get('/programme', controller.transactionsReport);
financialRoutes.get('/summary', controller.getFinancialYearReportSummary);
financialRoutes.post('/download-files/:fileName', controller.downloadFile);
financialRoutes.delete('/delete-file/:fileName', controller.deleteReportFile);
financialRoutes.get(
  '/by-programme/:programmeId',
  controller.getProgrammeFYReport
);
financialRoutes.get('/detail', controller.programmeFyReport);
financialRoutes.get('/stream', controller.allProgrammeFYReportStream);
financialRoutes.get('/student-details', controller.studentFyReportDetails);
financialRoutes.get('/pre-payments', controller.fySummaryTransactions);
financialRoutes.post('/details', controller.downloadProgrammeFYReport);
financialRoutes.post('/generate-report', controller.allProgrammeFYReportStream);
// financialRoutes.post('/generate-report', controller.generateReport);
financialRoutes.post('/student-details', controller.downloadStudentFyReport);

module.exports = financialRoutes;
