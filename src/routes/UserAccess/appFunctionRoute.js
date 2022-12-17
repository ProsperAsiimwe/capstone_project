const express = require('express');
const { AppFunctionController } = require('@controllers/index');
const { appFunctionValidator } = require('@validators/UserAccess');

const appFunctionRouter = express.Router();
const controller = new AppFunctionController();

// Program Management Routes.
appFunctionRouter.get('/', controller.index);
appFunctionRouter.post(
  '/',
  [appFunctionValidator.validateCreateAppFunction],
  controller.createAppFunction
);
appFunctionRouter.get('/:id', controller.fetchAppFunction);

appFunctionRouter.put(
  '/:id',
  [appFunctionValidator.validateUpdateAppFunction],
  controller.updateAppFunction
);

appFunctionRouter.put(
  '/many/:appId',
  [appFunctionValidator.validateUpdateAppFunction],
  controller.updateManyAppFunctions
);

appFunctionRouter.delete('/:id', controller.deleteAppFunction);

module.exports = appFunctionRouter;
