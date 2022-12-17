const express = require('express');
const { CourseAssignmentController } = require('@controllers/Result');

const markUploadCourseRouter = express.Router();
const controller = new CourseAssignmentController();

markUploadCourseRouter.get(
  '/upload-courses',
  controller.courseAssignmentFunction
);

module.exports = markUploadCourseRouter;
