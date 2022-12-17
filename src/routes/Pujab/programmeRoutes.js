const express = require('express');
const { PujabInstitutionProgrammeController } = require('@controllers/Pujab');
const { pujabValidator } = require('@validators/Pujab');

const programmeRouter = express.Router();
const controller = new PujabInstitutionProgrammeController();

// Program Management Routes.
programmeRouter.post(
  '/',
  [pujabValidator.validateCreateProgramme],
  controller.createProgramme
);
programmeRouter.post(
  '/download-template',
  controller.downloadProgrammeUploadTemplate
);

programmeRouter.post('/upload-template', controller.uploadProgramme);
programmeRouter.get(
  '/programmes-by-institution/:institutionId',
  controller.getAllInstitutionProgrammes
);
programmeRouter.get('/:id', controller.findOneInstitutionProgramme);
programmeRouter.put(
  '/:id',
  [pujabValidator.validateCreateProgramme],
  controller.updateInstitutionProgramme
);
programmeRouter.delete('/:id', controller.deleteInstitutionProgramme);

module.exports = programmeRouter;
