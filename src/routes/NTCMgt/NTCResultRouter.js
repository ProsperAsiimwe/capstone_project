const { NTCResultController } = require('@controllers/NTCMgt');
const express = require('express');

const NTCResultRouter = express.Router();
const controller = new NTCResultController();

NTCResultRouter.get('/', controller.index);
NTCResultRouter.post('/', controller.createNTCResult);
NTCResultRouter.post(
  '/download-template',
  controller.downloadNTCResultsTemplate
);
NTCResultRouter.post('/upload-template', controller.uploadNTCResultsTemplate);
NTCResultRouter.get('/programmes', controller.fetchNTCProgrammes);
NTCResultRouter.get('/termly', controller.fetchNTCTermlyResults);
NTCResultRouter.get('/:id', controller.findOneNTCResult);
NTCResultRouter.put('/:id', controller.updateNTCResult);
NTCResultRouter.delete('/:id', controller.deleteNTCResult);

module.exports = NTCResultRouter;
