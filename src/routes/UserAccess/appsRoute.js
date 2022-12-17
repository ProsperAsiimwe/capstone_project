const express = require('express');
const { ApplicationController } = require('@controllers/index');
const { appValidator } = require('@validators/UserAccess');

const applicationRouter = express.Router();
const controller = new ApplicationController();

// Program Management Routes.
applicationRouter.get('/', controller.index);

applicationRouter.post(
  '/',
  [appValidator.validateCreateApp],
  controller.createApplication
);
applicationRouter.get('/:id', controller.fetchApplication);

applicationRouter.put(
  '/:id',
  [appValidator.validateUpdateApp],
  controller.updateApplication
);

applicationRouter.delete('/:id', controller.deleteApplication);

module.exports = applicationRouter;
