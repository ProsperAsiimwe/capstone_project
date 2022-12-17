const express = require('express');
const { DepartmentController } = require('@controllers/ProgrammeManager');
const { departmentValidator } = require('@validators/ProgrammeManager');

const departmentRouter = express.Router();
const controller = new DepartmentController();

// DEPARTMENT Routes.
departmentRouter.get('/', controller.index);
departmentRouter.post(
  '/',
  [departmentValidator.validateCreateDepartment],
  controller.createDepartment
);
departmentRouter.post(
  '/download-template',
  controller.downloadDepartmentTemplate
);

departmentRouter.post('/upload-template', controller.uploadDepartmentsTemplate);
departmentRouter.get('/:id', controller.fetchDepartment);
departmentRouter.put(
  '/:id',
  // [departmentValidator.validateCreateDepartment],
  controller.updateDepartment
);
departmentRouter.delete('/:id', controller.deleteDepartment);

module.exports = departmentRouter;
