const AssignmentController = require('./assignment.controller');
const BuildingController = require('./building.controller');
const CourseAssignmentController = require('./courseAssignment.controller');
const TimetableController = require('./timetable.controller');
const SemesterCourseLoadController = require('./semesterCourseLoad.controller');
const LecturerCoursesFunction = require('./lecturerApp.controller');

module.exports = {
  AssignmentController,
  BuildingController,
  CourseAssignmentController,
  TimetableController,
  SemesterCourseLoadController,
  LecturerCoursesFunction,
};
