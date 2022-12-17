const express = require('express');
const {
  EnrollmentController,
  StudentEventController,
  MigratedEnrollmentRecordsController,
} = require('@controllers/EnrollmentAndRegistration');

const { ProgrammeVersionOptionsController } = require('@controllers/index');
const {
  enrollmentValidator,
} = require('@validators/EnrollmentAndRegistration');

const enrollmentRecordsRouter = express.Router();
const controller = new EnrollmentController();
const EventController = new StudentEventController();
const versionOptionsController = new ProgrammeVersionOptionsController();
const migratedEnrollments = new MigratedEnrollmentRecordsController();

enrollmentRecordsRouter.get(
  '/current-semester',
  controller.fetchCurrentSemester
);

enrollmentRecordsRouter.post(
  '/event/enroll',
  [enrollmentValidator.validateEnrollmentByStudent],
  EventController.enrollmentByStudent
);

enrollmentRecordsRouter.get(
  '/current-events/:studentProgrammeId',
  EventController.getStudentEnrollmentEvent
);
enrollmentRecordsRouter.get(
  '/history/:studentProgrammeId',
  EventController.getStudentEnrollmentRecords
);

enrollmentRecordsRouter.get(
  '/migrated/:studentProgrammeId',
  migratedEnrollments.studentMigratedEnrollments
);

enrollmentRecordsRouter.get(
  '/version/options/:versionId',
  versionOptionsController.versionOptionsFunction
);

module.exports = enrollmentRecordsRouter;
