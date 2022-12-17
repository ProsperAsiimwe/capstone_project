const express = require('express');
const {
  GraduateReportsController,
  GraduationStatisticsController,
} = require('@controllers/BiReporting');

const biRouter = express.Router();

// const { graduationListValidator } = require('@validators/Results');

const controller = new GraduateReportsController();

const statisticsController = new GraduationStatisticsController();

biRouter.get('/graduates', controller.graduateReportFunction);

biRouter.get('/detailed', controller.detailedGraduateReport);

biRouter.get('/statistics', statisticsController.graduateStatistics);

biRouter.post('/download-statistics', controller.downloadGraduationStatistics);

module.exports = biRouter;
