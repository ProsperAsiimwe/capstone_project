const express = require('express');
const {
  EnrollmentController,
} = require('@controllers/EnrollmentAndRegistration');
const {
  PreviousEnrollmentRecordsController,
} = require('@controllers/StudentRecords');
const {
  enrollmentValidator,
} = require('@validators/EnrollmentAndRegistration');

const enrollmentRecordsRouter = express.Router();
const controller = new EnrollmentController();
const previousRecordsController = new PreviousEnrollmentRecordsController();

enrollmentRecordsRouter.get(
  '/current-semester/:studentProgrammeId',
  controller.fetchCurrentSemester
);

enrollmentRecordsRouter.get(
  '/current-semester-events/:studentProgrammeId',
  controller.fetchAllSemesterBoundEvents
);

enrollmentRecordsRouter.post(
  '/bill-previous-balances',
  [enrollmentValidator.validateBillPreviousEnrollment],
  previousRecordsController.billPreviousEnrollmentBalances
);

enrollmentRecordsRouter.post(
  '/migrate-previous-other-fees',
  previousRecordsController.migratePreviousOtherFeesInvoices
);

enrollmentRecordsRouter.post(
  '/fix-unbilled-duplicate-records',
  previousRecordsController.fixUnbilledDuplicatesInPreviousPayments
);

enrollmentRecordsRouter.post(
  '/fix-billed-duplicate-records',
  previousRecordsController.fixBilledDuplicatesInPreviousPayments
);

enrollmentRecordsRouter.post(
  '/enroll-student/:studentId',
  [enrollmentValidator.validateEnrollmentByStaff],
  controller.createEnrollmentByStaff
);

enrollmentRecordsRouter.post(
  '/late-enrollment/:studentId',
  [enrollmentValidator.validateLateEnrollmentByStaff],
  controller.createLateEnrollmentByStaff
);

enrollmentRecordsRouter.get(
  '/history/:studentProgrammeId',
  controller.fetchAllEnrollmentRecords
);

enrollmentRecordsRouter.post(
  '/de-enroll/:studentId',
  [enrollmentValidator.validateDeEnrollment],
  controller.deEnrollAStudent
);

module.exports = enrollmentRecordsRouter;
