const express = require('express');
const { LecturerCoursesFunction } = require('@controllers/courseAssignment');

const lectureAppRouter = express.Router();
const controller = new LecturerCoursesFunction();

lectureAppRouter.get('/courses', controller.LecturerCoursesFunction);
lectureAppRouter.get('/students', controller.programmeEnrolledStudents);

module.exports = lectureAppRouter;
