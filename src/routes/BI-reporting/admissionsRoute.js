// admissionBiReport
const express = require('express');
const {
  AdmissionBiReportController,
  TransactionsReportController,
  EnrollmentStatController,
} = require('@controllers/BiReporting');

const admissionRoutes = express.Router();

const controller = new AdmissionBiReportController();
const trans = new TransactionsReportController();
const enrollment = new EnrollmentStatController();

admissionRoutes.get('/', controller.admissionBiReport);
admissionRoutes.get('/programmes', controller.admissionProgrammeReport);
admissionRoutes.get('/age', controller.admissionAgeReport);
admissionRoutes.get('/trans', trans.transactionsReport);
admissionRoutes.get('/trans-unit', trans.transactionsAcademicUnit);
admissionRoutes.get('/enrollment-stat', enrollment.enrollmentStatistics);
admissionRoutes.post('/download-stat', enrollment.downloadEnrollmentStatistics);

module.exports = admissionRoutes;
