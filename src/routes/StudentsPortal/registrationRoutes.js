const express = require('express');
const {
  StudentEventController,
} = require('@controllers/EnrollmentAndRegistration');
const {
  registrationValidator,
} = require('@validators/EnrollmentAndRegistration');

const registrationRecordsRouter = express.Router();
const EventController = new StudentEventController();

registrationRecordsRouter.post(
  '/event/register',
  [registrationValidator.validateRegistrationByStudent],
  EventController.registrationByStudent
);

registrationRecordsRouter.get(
  '/course-units/:studentProgrammeId',
  EventController.getRegistrationEventCourseUnits
);

registrationRecordsRouter.post(
  '/update-course-units/:registrationId',
  [registrationValidator.validateUpdateCourseUnits],
  EventController.updateCourseUnits
);

registrationRecordsRouter.get(
  '/history/:studentProgrammeId',
  EventController.registrationCourseUnitsByStudent
);

module.exports = registrationRecordsRouter;
