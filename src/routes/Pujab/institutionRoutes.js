const express = require('express');
const { PujabInstitutionController } = require('@controllers/Pujab');
const { pujabValidator } = require('@validators/Pujab');

const institutionRouter = express.Router();
const controller = new PujabInstitutionController();

// Program Management Routes.
institutionRouter.get('/', controller.getAllInstitutions);
institutionRouter.post(
  '/',
  [pujabValidator.validateCreateInstitution],
  controller.createInstitution
);
institutionRouter.post(
  '/download-template',
  controller.downloadInstitutionUploadTemplate
);

institutionRouter.post('/upload-template', controller.uploadInstitution);

institutionRouter.get('/:id', controller.findOneInstitution);
institutionRouter.put(
  '/:id',
  [pujabValidator.validateCreateInstitution],
  controller.updateInstitution
);
institutionRouter.delete('/:id', controller.deleteInstitution);

module.exports = institutionRouter;
