const express = require('express');
const { SemesterController } = require('@controllers/EventScheduler');
const { semesterValidator } = require('@validators/EventScheduler');

const semesterRouter = express.Router();
const controller = new SemesterController();

// Events Management Routes.
semesterRouter.get('/', controller.index);

semesterRouter.post(
  '/',
  [semesterValidator.validateCreateSemester],
  controller.createSemester
);
semesterRouter.get('/:id', controller.fetchSemester);
semesterRouter.put(
  '/:id',
  [semesterValidator.validateUpdateSemester],
  controller.updateSemester
);
semesterRouter.delete('/:id', controller.deleteSemester);

module.exports = semesterRouter;
