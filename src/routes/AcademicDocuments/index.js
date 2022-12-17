const { PrintDocumentController } = require('@controllers/index');
const { documentValidator } = require('@validators/AcademicDocuments');
const { Router } = require('express');

const documentRouter = Router();

const controller = new PrintDocumentController();

documentRouter.post('/print/certificate', controller.generateCertificate);
documentRouter.post(
  '/print/transcript',
  [documentValidator.validateGenerateTranscriptForm],
  controller.generateTranscript
);
documentRouter.get('/print/render', controller.renderTranscriptView);
documentRouter.get(
  '/print/render/certificate',
  controller.renderCertificateView
);
documentRouter.get(
  '/print/render/admission-letter',
  controller.renderAdmissionLetter
);
documentRouter.post(
  '/download/:category',
  [documentValidator.validateDownloadDocumentScheme],
  controller.downloadDocuments
);

module.exports = documentRouter;
