// enrollmentBiReportController

const express = require('express');
const {
  EnrollmentBiReportController,
  ResultBiReportController,
} = require('@controllers/BiReporting');

const enrollmentRoutes = express.Router();

const controller = new EnrollmentBiReportController();
const resultController = new ResultBiReportController();

enrollmentRoutes.get('/', controller.enrollmentBiReport);
enrollmentRoutes.get('/result', resultController.resultSummary);

module.exports = enrollmentRoutes;
