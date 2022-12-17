const express = require('express');
const { NTCSubjectController } = require('@controllers/NTCMgt');
const { NTCSubjectValidator } = require('@validators/NTCMgt');

const NTCSubjectRouter = express.Router();
const controller = new NTCSubjectController();

NTCSubjectRouter.get('/', controller.index);
NTCSubjectRouter.post(
  '/',
  [NTCSubjectValidator.validateCreateNTCSubject],
  controller.createNTCSubject
);

NTCSubjectRouter.post(
  '/download-template',
  controller.downloadNTCSubjectsTemplate
);
NTCSubjectRouter.post('/upload-template', controller.uploadNTCSubjects);

NTCSubjectRouter.get('/:id', controller.findNTCSubject);
NTCSubjectRouter.put('/:id', controller.updateNTCSubject);
NTCSubjectRouter.delete('/:id', controller.deleteNTCSubject);

module.exports = NTCSubjectRouter;
