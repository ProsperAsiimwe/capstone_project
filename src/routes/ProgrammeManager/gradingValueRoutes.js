const express = require('express');
const { GradingValueController } = require('@controllers/ProgrammeManager');
const { gradingValueValidator } = require('@validators/ProgrammeManager');

const gradingValueRouter = express.Router();
const controller = new GradingValueController();

// GradingValue Management Routes.
gradingValueRouter.get('/', [], controller.index);
gradingValueRouter.post(
  '/',
  [gradingValueValidator.validateCreateGradingValue],
  controller.createGradingValue
);
gradingValueRouter.get('/:id', [], controller.fetchGradingValue);
gradingValueRouter.put(
  '/:id',
  [gradingValueValidator.validateCreateGradingValue],
  controller.updateGradingValue
);
gradingValueRouter.put(
  '/many/:gradingId',
  // [gradingValueValidator.validateCreateGradingValue],
  controller.updateManyGradingValues
);
gradingValueRouter.delete('/:id', controller.deleteGradingValue);

module.exports = gradingValueRouter;
