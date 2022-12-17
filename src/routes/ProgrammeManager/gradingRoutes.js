const express = require('express');
const { GradingController } = require('@controllers/index');
const { gradingValidator } = require('@validators/ProgrammeManager');

const gradingRouter = express.Router();
const controller = new GradingController();

// Grading Management Routes.
gradingRouter.get('/', [], controller.index);
gradingRouter.post(
  '/',
  [gradingValidator.validateCreateGrading],
  controller.createGrading
);
gradingRouter.get('/:id', [], controller.fetchGrading);
gradingRouter.put(
  '/:id',
  [gradingValidator.validateCreateGrading],
  controller.updateGrading
);
gradingRouter.delete('/:id', controller.deleteGrading);

module.exports = gradingRouter;
