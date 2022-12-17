const express = require('express');
const {
  SummaryReportsController,
  DetailedReportsController,
  DetailedReportStudentsController,
  PaymentTransactionReportsController,
  PaymentsTransactionReportsStudentsController,
  SummaryEnrollmentReportController,
  DetailedReportsDownloadsController,
  SummaryAcademicUnitController,
  SummaryPaymentReportController,
  SummaryPaymentsCampusController,
  FeesDepositsReportsController,
  RegistrationStatisticsController,
  DownloadStatisticsController,
  DownloadStudentsPaymentController,
} = require('@controllers/EnrollmentAndRegistration');

const enrollmentAndRegistrationReportsRouter = express.Router();
const controller = new SummaryReportsController();
const detailedReportsController = new DetailedReportsController();
const studentEnrollmentRecords = new DetailedReportStudentsController();
const paymentsTransactionsReports = new PaymentTransactionReportsController();
const paymentsTransactionsRecords =
  new PaymentsTransactionReportsStudentsController();
const downloadStudentPayment = new DownloadStudentsPaymentController();

const enrollmentStatus = new SummaryEnrollmentReportController();
const summaryAcademicUnit = new SummaryAcademicUnitController();
const downloadReports = new DetailedReportsDownloadsController();
const paymentSummaryReports = new SummaryPaymentReportController();
const paymentSummaryCampusReports = new SummaryPaymentsCampusController();
const feesDepositReportController = new FeesDepositsReportsController();
const registrationStatisticsController = new RegistrationStatisticsController();
const downloadStatisticsController = new DownloadStatisticsController();

enrollmentAndRegistrationReportsRouter.get(
  '/report',
  controller.summaryReportsFunction
);

enrollmentAndRegistrationReportsRouter.get(
  '/detailed-report',
  detailedReportsController.detailedReportsFunction
);

enrollmentAndRegistrationReportsRouter.get(
  '/enrollment-status',
  enrollmentStatus.enrollmentStatusFunction
);

enrollmentAndRegistrationReportsRouter.get(
  '/enrollment-academic-unit',
  summaryAcademicUnit.enrollmentAcademicUnitReport
);

enrollmentAndRegistrationReportsRouter.get(
  '/student-enrollment-records',
  studentEnrollmentRecords.detailedReportStudentsFunction
);

// transaction

enrollmentAndRegistrationReportsRouter.get(
  '/payment-transactions-report',
  paymentsTransactionsReports.paymentTransactionsReports
);
enrollmentAndRegistrationReportsRouter.get(
  '/academic-unit-report',
  paymentSummaryReports.paymentAcademicUnitReport
);

// paymentSummaryCampusReports
enrollmentAndRegistrationReportsRouter.get(
  '/campuses-report',
  paymentSummaryCampusReports.paymentCampusReport
);

enrollmentAndRegistrationReportsRouter.get(
  '/registration-statistics',
  registrationStatisticsController.registrationStatistics
);

// feesDepositReportController
enrollmentAndRegistrationReportsRouter.get(
  '/fees-deposits-report',
  feesDepositReportController.feesDepositsReports
);

enrollmentAndRegistrationReportsRouter.get(
  '/programme-deposit-report',
  feesDepositReportController.feesDepositsProgrammeReport
);

enrollmentAndRegistrationReportsRouter.get(
  '/payment-transactions-records',
  paymentsTransactionsRecords.paymentTransactionsStudentData
);

//  examCardCourse
enrollmentAndRegistrationReportsRouter.post(
  '/exam-card-course',
  studentEnrollmentRecords.examCardCourse
);

enrollmentAndRegistrationReportsRouter.post(
  '/download-report',
  studentEnrollmentRecords.detailedReportDownLoad
);

enrollmentAndRegistrationReportsRouter.post(
  '/download-faculty',
  downloadReports.detailedReportsDownLoad
);
enrollmentAndRegistrationReportsRouter.post(
  '/download-registered',
  downloadReports.registeredStudentsDownload
);
enrollmentAndRegistrationReportsRouter.post(
  '/download-unregistered',
  downloadReports.unregisteredStudentsDownload
);
enrollmentAndRegistrationReportsRouter.post(
  '/download-payments',
  paymentsTransactionsRecords.StudentsPaymentDataDownload
);

// downloadStudentPayment
enrollmentAndRegistrationReportsRouter.post(
  '/download-student-payments',
  downloadStudentPayment.downloadStudentPayments
);

enrollmentAndRegistrationReportsRouter.post(
  '/download-prepayments',
  feesDepositReportController.downloadFeesDeposits
);

// downloadStatisticsController
enrollmentAndRegistrationReportsRouter.post(
  '/download-statistics',
  downloadStatisticsController.downloadRegistrationStatistics
);

/*


enrollmentAndRegistrationReportsRouter.get(
  "/current-semester-events/:student_id"
  controller.enrollmentAndRegistrationSummaryReport
);

enrollmentAndRegistrationReportsRouter.get(
  "/history/:student_id",
  controller.enrollmentAndRegistrationSummaryReport
);

*/
module.exports = enrollmentAndRegistrationReportsRouter;
