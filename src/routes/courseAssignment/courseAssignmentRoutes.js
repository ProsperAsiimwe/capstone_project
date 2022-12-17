const express = require('express');
const { CourseAssignmentController } = require('@controllers/courseAssignment');

const courseAssignmentViewsRouter = express.Router();
const controller = new CourseAssignmentController();

// Course Management Routes.
courseAssignmentViewsRouter.get(
  '/course-lecturers',
  controller.usersWithLecturerRoleFunction
);

courseAssignmentViewsRouter.get(
  '/course-groupings',
  controller.courseAssignmentGroupingFunction
);

courseAssignmentViewsRouter.get(
  '/department-programmes',
  controller.programmesByCampusAndDepartmentFunction
);

// course units -- courseUnitByContextFunction
courseAssignmentViewsRouter.get(
  '/programmes-courses',
  controller.courseUnitByContextFunction
);

// courseAssignmentsByContext5

courseAssignmentViewsRouter.get(
  '/course-assignments',
  controller.courseAssignmentsByContext
);

courseAssignmentViewsRouter.get('/role-users', controller.usersByRolesFunction);

module.exports = courseAssignmentViewsRouter;
