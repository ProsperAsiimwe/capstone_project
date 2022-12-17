const Assignment = require('./assignment.model');
const AssignmentCourse = require('./assignmentCourse.model');
const AssignmentCourseGroup = require('./assignmentCourseGroup.model');
const AssignmentCourseLecturer = require('./assignmentCourseLecturer.model');
const Building = require('./building.model');
const BuildingRoom = require('./buildingRoom.model');
const TeachingTimetable = require('./teachingTimetable.model');
const SemesterCourseLoadContext = require('./semesterCourseLoadContext.model');
const SemesterCourseLoad = require('./semesterCourseLoad.model');

module.exports = {
  Assignment,
  AssignmentCourse,
  AssignmentCourseGroup,
  AssignmentCourseLecturer,
  Building,
  BuildingRoom,
  TeachingTimetable,
  SemesterCourseLoadContext,
  SemesterCourseLoad,
};
