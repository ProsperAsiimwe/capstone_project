const express = require('express');
const { CollegeController } = require('@controllers/ProgrammeManager');
const { collegeValidator } = require('@validators/ProgrammeManager');

const collegeRouter = express.Router();
const controller = new CollegeController();

// Program Management Routes.
collegeRouter.get('/', controller.index);
collegeRouter.post(
  '/',
  [collegeValidator.validateCreateCollege],
  controller.createCollege
);
collegeRouter.post('/download-template', controller.downloadCollegeTemplate);

collegeRouter.post('/upload-template', controller.uploadCollegesTemplate);

collegeRouter.get('/:id', controller.fetchCollege);
collegeRouter.put(
  '/:id',
  [collegeValidator.validateCreateCollege],
  controller.updateCollege
);
collegeRouter.delete('/:id', controller.deleteCollege);

module.exports = collegeRouter;
