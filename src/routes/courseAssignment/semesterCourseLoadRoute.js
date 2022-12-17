const express = require('express');
const {
  SemesterCourseLoadController,
} = require('@controllers/courseAssignment');
const { semesterCourseLoadValidator } = require('@validators/courseAssignment');

const semesterCourseLoadRouter = express.Router();
const controller = new SemesterCourseLoadController();

// Routes.
semesterCourseLoadRouter.get('/', controller.getContextLoads);

semesterCourseLoadRouter.post(
  '/',
  semesterCourseLoadValidator.validateCreateSemesterCourseLoad,
  controller.createSemesterLoads
);

semesterCourseLoadRouter.put(
  '/:contextId',
  semesterCourseLoadValidator.validateUpdateSemesterCourseLoad,
  controller.updateContextValues
);

module.exports = semesterCourseLoadRouter;
