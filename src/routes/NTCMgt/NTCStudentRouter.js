const { NTCStudentController } = require('@controllers/NTCMgt');
const express = require('express');

const NTCStudentRouter = express.Router();
const controller = new NTCStudentController();

NTCStudentRouter.get('/', controller.index);
NTCStudentRouter.post('/', controller.createNTCStudent);
NTCStudentRouter.post(
  '/download-template',
  controller.downloadNTCStudentsTemplate
);
NTCStudentRouter.post('/upload-template', controller.uploadNTCStudentsTemplate);
NTCStudentRouter.post(
  '/generate-documents/:documentType',
  controller.generateNTCAcademicDocuments
);
NTCStudentRouter.get(
  '/student-documents',
  controller.fetchNTCStudentsDocuments
);
NTCStudentRouter.get('/:id', controller.fetchNTCStudent);
NTCStudentRouter.get(
  '/render/certificate',
  controller.renderNTCCertificateView
);
NTCStudentRouter.get('/render/transcript', controller.renderNTCTranscriptView);
NTCStudentRouter.put('/:id', controller.updateNTCStudent);
NTCStudentRouter.delete('/:id', controller.deleteNTCStudent);

module.exports = NTCStudentRouter;
