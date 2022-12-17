// reportFunction

const express = require('express');
const {
  ReportsController,
  DetailedReportController,
  ReportResultCategoriesController,
} = require('@controllers/Result');

const reportsRouter = express.Router();

const reportsController = new ReportsController();
const detailedReportController = new DetailedReportController();
const summaryController = new ReportResultCategoriesController();

reportsRouter.get('/', reportsController.reportFunction);
reportsRouter.get('/detailed', detailedReportController.detailedReportFunction);
reportsRouter.get('/summary', summaryController.summaryReportFunction);
reportsRouter.get(
  '/download-detailed',
  detailedReportController.downloadDetailedResults
);

// programmesByDepartment
reportsRouter.get('/programmes', reportsController.programmesByDepartment);

module.exports = reportsRouter;
