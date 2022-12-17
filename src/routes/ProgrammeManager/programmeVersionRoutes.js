const express = require('express');
const {
  ProgrammeVersionController,
  ProgrammeVersionOptionsController,
  ProgrammeVersionCourseUnitController,
} = require('@controllers/ProgrammeManager');

const { programmeValidator } = require('@validators/ProgrammeManager');

const programmeVersionRouter = express.Router();
const controller = new ProgrammeVersionController();
const versionCourseUnitController = new ProgrammeVersionCourseUnitController();
const versionOptionsController = new ProgrammeVersionOptionsController();

// Program Version Routes.
programmeVersionRouter.get('/', controller.index);
programmeVersionRouter.post(
  '/',
  [programmeValidator.validateCreateProgrammeVersion],
  controller.store
);
programmeVersionRouter.get('/:id', controller.show);
programmeVersionRouter.put(
  '/:id',
  [programmeValidator.validateCreateProgrammeVersion],
  controller.update
);
programmeVersionRouter.delete('/:id', controller.delete);
programmeVersionRouter.get(
  '/course-units/:versionId',
  controller.versionWithCourseUnits
);

// Delete course unit from programme version
programmeVersionRouter.delete(
  '/delete-version-course-unit/:versionCourseUnitId',
  versionCourseUnitController.deleteVersionCourseUnit
);

// Update a programme version course-unit
programmeVersionRouter.put(
  '/update-version-course-unit/:versionCourseUnitId',
  [programmeValidator.validateUpdateProgrammeVersionCourseUnits],
  versionCourseUnitController.updateProgrammeVersionCourseUnit
);

programmeVersionRouter.get(
  '/fetch-version-course-unit/:versionCourseUnitId',
  versionCourseUnitController.fetchVersionCourseUnit
);

programmeVersionRouter.get(
  '/options/:versionId',
  versionOptionsController.versionOptionsFunction
);

module.exports = programmeVersionRouter;
