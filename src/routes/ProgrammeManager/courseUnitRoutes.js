const express = require('express');
const { CourseUnitController } = require('@controllers/ProgrammeManager');
const { courseUnitValidator } = require('@validators/ProgrammeManager');

const courseUnitRouter = express.Router();
const controller = new CourseUnitController();

// Program Management Routes.
courseUnitRouter.get('/', controller.index);

courseUnitRouter.post(
  '/',
  [courseUnitValidator.validateCreateCourseUnit],
  controller.createCourseUnit
);

courseUnitRouter.get('/search/:courseUnitCode', controller.searchCourseUnit);

courseUnitRouter.post(
  '/upload/:programmeId/:versionId',
  controller.uploadCourseUnits
);

courseUnitRouter.post(
  '/download-template/:programmeId/:versionId',
  controller.downloadCourseUnitsTemplate
);

courseUnitRouter.put(
  '/update-repo-course-unit/:id',
  [courseUnitValidator.validateUpdateCourseUnit],
  controller.updateCourseUnit
);
courseUnitRouter.put(
  '/assign-department/:id/:departmentId',
  controller.assignDepartment
);

// Delete course unit from programme version
courseUnitRouter.delete(
  '/delete-repo-course-unit/:courseUnitId',
  controller.deleteCourseUnit
);

module.exports = courseUnitRouter;
