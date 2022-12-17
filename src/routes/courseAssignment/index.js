const { Router } = require('express');
const assignmentRouter = require('./assignmentRoutes');
const courseAssignmentViewsRouter = require('./courseAssignmentRoutes');
const buildingRouter = require('./buildingRoutes');
const timetableRouter = require('./timetableRoutes');
const semesterCourseLoadRouter = require('./semesterCourseLoadRoute');
const lectureAppRouter = require('./lecturerAppRoutes');

//   Module Endpoints
const courseAssignmentRouter = Router();

courseAssignmentRouter.use('/', courseAssignmentViewsRouter);
courseAssignmentRouter.use('/', assignmentRouter);
courseAssignmentRouter.use('/buildings', buildingRouter);
courseAssignmentRouter.use('/timetables', timetableRouter);
courseAssignmentRouter.use('/semester-course-loads', semesterCourseLoadRouter);
courseAssignmentRouter.use('/lecturer', lectureAppRouter);

module.exports = courseAssignmentRouter;
