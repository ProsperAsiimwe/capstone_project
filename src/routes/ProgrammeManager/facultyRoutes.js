const { Router } = require('express');
const { FacultyController } = require('@controllers/ProgrammeManager');
const { facultyValidator } = require('@validators/ProgrammeManager');

const facultyRouter = Router();
const controller = new FacultyController();

//  Faculty Module API Endpoints
facultyRouter.get('/', [], controller.index);
facultyRouter.post(
  '/',
  [facultyValidator.validateCreateFaculty],
  controller.store
);
facultyRouter.post('/download-template', controller.downloadFacultyTemplate);

facultyRouter.post('/upload-template', controller.uploadFacultiesTemplate);
facultyRouter.get('/:id', [], controller.show);
facultyRouter.put(
  '/:id',
  // [facultyValidator.validateCreateFaculty],
  controller.update
);
facultyRouter.delete('/:id', controller.delete);

module.exports = facultyRouter;
