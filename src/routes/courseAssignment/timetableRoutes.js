const express = require('express');
const { TimetableController } = require('@controllers/courseAssignment');
const { timetableValidator } = require('@validators/courseAssignment');

const timetableRouter = express.Router();
const controller = new TimetableController();

// Routes.
timetableRouter.get('/teaching-timetable/', controller.getTeachingTimetable);

timetableRouter.post(
  '/create-teaching-timetable/:assignmentCourseId',
  [timetableValidator.validateCreateTeachingTimetable],
  controller.createTeachingTimetable
);

timetableRouter.put(
  '/update-teaching-timetable/:id',
  [timetableValidator.validateUpdateTeachingTimetable],
  controller.updateTeachingTimetable
);

timetableRouter.delete(
  '/delete-teaching-timetable/:id',
  controller.deleteTeachingTimetable
);

module.exports = timetableRouter;
