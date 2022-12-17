const express = require('express');
const {
  RegistrationController,
} = require('@controllers/EnrollmentAndRegistration');
const {
  registrationValidator,
} = require('@validators/EnrollmentAndRegistration');

const registrationRecordsRouter = express.Router();
const controller = new RegistrationController();

registrationRecordsRouter.get(
  '/course-units/:studentProgrammeId',
  controller.getRegistrationEventCourseUnits
);

registrationRecordsRouter.get(
  '/exam-card-constraints/:registrationId',
  controller.getExamCardConstraints
);

registrationRecordsRouter.get(
  '/late-registration/course-units/:studentProgrammeId/:semesterId',
  controller.getLateRegistrationCourseUnits
);

registrationRecordsRouter.get(
  '/late-registration-events/:studentId',
  controller.fetchAllRegistrationEventsForLateRegistration
);

registrationRecordsRouter.post(
  '/register',
  [registrationValidator.validateRegistrationByStaff],
  controller.createRegistrationByStaff
);

registrationRecordsRouter.post(
  '/late-registration/:studentId',
  [registrationValidator.validateLateRegistrationByStaff],
  controller.createLateRegistrationByStaff
);

registrationRecordsRouter.get(
  '/history/:studentProgrammeId',
  controller.fetchAllRegistrationRecordsByStudentId
);

registrationRecordsRouter.post(
  '/update-course-units/:registrationId',
  [registrationValidator.validateUpdateCourseUnits],
  controller.updateCourseUnits
);

registrationRecordsRouter.post(
  '/de-register/:studentId',
  [registrationValidator.validateDeRegistration],
  controller.deRegisterAStudent
);

registrationRecordsRouter.put(
  '/de-register-batch-students',
  controller.deRegisterBatchStudentsFromTemplate
);

module.exports = registrationRecordsRouter;
