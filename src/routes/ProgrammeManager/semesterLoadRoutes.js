const express = require('express');
const { SemesterLoadController } = require('@controllers/ProgrammeManager');
const { semesterLoadValidator } = require('@validators/ProgrammeManager');

const semesterLoadRouter = express.Router();
const controller = new SemesterLoadController();

// SemesterLoad Management Routes.
semesterLoadRouter.get('/', [], controller.index);
semesterLoadRouter.post(
  '/',
  [semesterLoadValidator.validateCreateSemesterLoad],
  controller.createSemesterLoad
);
semesterLoadRouter.get('/:id', [], controller.fetchSemesterLoad);
semesterLoadRouter.put(
  '/:id',
  [semesterLoadValidator.validateUpdateSemesterLoad],
  controller.updateSemesterLoad
);
semesterLoadRouter.delete('/:id', controller.deleteSemesterLoad);

module.exports = semesterLoadRouter;
