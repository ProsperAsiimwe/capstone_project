const express = require('express');
const { SpecializationController } = require('@controllers/ProgrammeManager');
const { specializationValidator } = require('@validators/ProgrammeManager');
const { courseUnitValidator } = require('@validators/ProgrammeManager');

const specializationRouter = express.Router();
const controller = new SpecializationController();

// Program Management Routes.
specializationRouter.get('/', controller.index);
specializationRouter.post(
  '/',
  // [specializationValidator.validateCreateSpecialization],
  controller.createSpecialization
);
specializationRouter.get('/:id', controller.fetchSpecialization);
specializationRouter.put(
  '/:id',
  // [specializationValidator.validateCreateSpecialization],
  controller.updateSpecialization
);
specializationRouter.delete('/:id', controller.deleteSpecialization);

// Add course-units to specializations
specializationRouter.post(
  '/add-course-unit/:programmeVersionSpecializationId',
  [courseUnitValidator.validateCourseUnitToSpecialization],
  controller.addCourseUnit
);

// Delete specialization course unit
specializationRouter.delete(
  '/delete-course-unit/:specializationCourseUnitId',
  controller.deleteSpecializationCourseUnit
);

module.exports = specializationRouter;
