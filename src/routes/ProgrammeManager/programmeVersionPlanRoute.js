const express = require('express');
const { ProgrammeVersionPlanController } = require('@controllers/index');
const {
  programmeVersionPlanValidator,
} = require('@validators/ProgrammeManager');
const { courseUnitValidator } = require('@validators/ProgrammeManager');

const programmeVersionPlanRouter = express.Router();
const controller = new ProgrammeVersionPlanController();

//  Routes.
programmeVersionPlanRouter.get('/', controller.index);
programmeVersionPlanRouter.post(
  '/',
  [programmeVersionPlanValidator.validateCreateProgrammeVersionPlan],
  controller.createProgrammeVersionPlan
);
programmeVersionPlanRouter.get('/:id', controller.fetchProgrammeVersionPlan);
programmeVersionPlanRouter.put(
  '/:id',
  [programmeVersionPlanValidator.validateCreateProgrammeVersionPlan],
  controller.updateProgrammeVersionPlan
);
programmeVersionPlanRouter.delete(
  '/:id',
  controller.deleteProgrammeVersionPlan
);

// Add course-units to plans
programmeVersionPlanRouter.post(
  '/add-course-unit/:programmeVersionPlanId',
  [courseUnitValidator.validateCourseUnitToPlan],
  controller.addCourseUnit
);

// Delete plan course unit
programmeVersionPlanRouter.delete(
  '/delete-course-unit/:planCourseUnitId',
  controller.deletePlanCourseUnit
);

module.exports = programmeVersionPlanRouter;
