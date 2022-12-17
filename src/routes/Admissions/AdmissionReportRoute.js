const express = require('express');
const {
  AdmissionSchemeReportsController,
  ReportsAdmittedAnalyticsController,
  AdmissionStatisticsController,
  GraduateProgrammeController,
} = require('@controllers/Admissions');

const reportRouter = express.Router();
const controller = new AdmissionSchemeReportsController();
const reportsController = new ReportsAdmittedAnalyticsController();

const statisticsController = new AdmissionStatisticsController();

const pdfController = new GraduateProgrammeController();

// admission scheme report
reportRouter.get('/', controller.admissionSchemeReport);

// searchAdmittedApplicant
reportRouter.get(
  '/search-admitted-applicant',
  controller.searchAdmittedApplicant
);
reportRouter.get('/analytics', reportsController.admissionAnalyticsReport);

reportRouter.get(
  '/admission-statistics',
  statisticsController.admissionStatistics
);
reportRouter.post(
  '/download-admission-statistics',
  statisticsController.downloadAdmissionStatistics
);

reportRouter.post(
  '/applicant-subjects',
  controller.downloadApplicantSubjectCombination
);
reportRouter.post(
  '/admitted-applicants',
  controller.admittedApplicantsDownload
);

// pdfAdmittedApplicants
reportRouter.post(
  '/pdf-admitted-applicants',
  pdfController.pdfAdmittedApplicants
);

module.exports = reportRouter;
