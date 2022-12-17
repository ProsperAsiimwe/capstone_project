const express = require('express');
const { SubjectController } = require('@controllers/index');
const { subjectValidator } = require('@validators/ProgrammeManager');

const subjectRouter = express.Router();
const controller = new SubjectController();

// DEPARTMENT Routes.
subjectRouter.get('/', controller.index);
subjectRouter.post(
  '/',
  // [subjectValidator.validateCreateSubject],
  controller.createSubject
);
subjectRouter.get('/:id', controller.fetchSubject);
subjectRouter.put(
  '/:id',
  // [subjectValidator.validateCreateSubject],
  controller.updateSubject
);
subjectRouter.delete('/:id', controller.deleteSubject);

module.exports = subjectRouter;
