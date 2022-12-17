const express = require('express');
const { AssignmentController } = require('@controllers/courseAssignment');
const { assignmentValidator } = require('@validators/courseAssignment');

const assignmentRouter = express.Router();
const controller = new AssignmentController();

// Course Management Routes.
assignmentRouter.get('/', controller.index);

assignmentRouter.post(
  '/',
  [assignmentValidator.validateCreateCourseAssignment],
  controller.createRecord
);

assignmentRouter.post(
  '/add-course-unit/:assignmentId',
  [assignmentValidator.validateAddCourseUnits],
  controller.addCourseUnits
);

assignmentRouter.post(
  '/add-course-unit-groups/:assignmentCourseId',
  [assignmentValidator.validateAddCourseUnitGroups],
  controller.addCourseUnitGroups
);

assignmentRouter.post(
  '/add-course-unit-lecturers/:assignmentCourseId',
  [assignmentValidator.validateAddCourseUnitLecturers],
  controller.addCourseUnitLecturers
);

assignmentRouter.put(
  '/:id',
  [assignmentValidator.updateCourseAssignmentSchema],
  controller.updateRecord
);

assignmentRouter.put(
  '/update-course-units/:id',
  [assignmentValidator.validateUpdateCourseUnits],
  controller.updateCourseUnit
);

assignmentRouter.put(
  '/update-course-unit-group/:id',
  [assignmentValidator.validateUpdateCourseUnitGroups],
  controller.updateCourseUnitGroup
);

assignmentRouter.put(
  '/update-course-unit-lecturer/:id',
  [assignmentValidator.validateUpdateCourseUnitLecturers],
  controller.updateCourseUnitLecturer
);

assignmentRouter.delete('/:id', controller.deleteRecord);

assignmentRouter.delete('/delete-course-unit/:id', controller.deleteRecord);

assignmentRouter.delete(
  '/delete-course-unit-group/:id',
  controller.deleteCourseUnitGroups
);

assignmentRouter.delete(
  '/delete-course-unit-lecturer/:id',
  controller.deleteCourseUnitLecturer
);

module.exports = assignmentRouter;
