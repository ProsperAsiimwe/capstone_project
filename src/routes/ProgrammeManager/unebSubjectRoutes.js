const express = require('express');
const { UnebSubjectController } = require('@controllers/ProgrammeManager');
const { unebSubjectValidator } = require('@validators/ProgrammeManager');

const unebSubjectRouter = express.Router();
const controller = new UnebSubjectController();

// DEPARTMENT Routes.
unebSubjectRouter.get('/', controller.index);
unebSubjectRouter.post(
  '/',
  [unebSubjectValidator.validateCreateUnebSubject],
  controller.createUnebSubject
);

unebSubjectRouter.post(
  '/download-template',
  controller.downloadUnebSubjectsTemplate
);
unebSubjectRouter.post('/upload-template', controller.uploadUnebSubjects);

unebSubjectRouter.get('/:id', controller.fetchUnebSubject);
unebSubjectRouter.put(
  '/:id',
  // [unebSubjectValidator.validateCreateUnebSubject],
  controller.updateUnebSubject
);
unebSubjectRouter.delete('/:id', controller.deleteUnebSubject);

module.exports = unebSubjectRouter;
