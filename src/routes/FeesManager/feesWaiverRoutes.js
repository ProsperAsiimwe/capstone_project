const express = require('express');
const { FeesWaiverController } = require('@controllers/FeesManager');
const { feesWaiverValidator } = require('@validators/FeesManager');

const feesWaiverRouter = express.Router();
const controller = new FeesWaiverController();

// Events Management Routes.
feesWaiverRouter.get('/', controller.index);

feesWaiverRouter.post(
  '/',
  [feesWaiverValidator.validateCreateFeesWaiver],
  controller.createFeesWaiver
);

feesWaiverRouter.get('/:id', controller.fetchFeesWaiver);
feesWaiverRouter.put(
  '/:id',
  [feesWaiverValidator.validateUpdateFeesWaiver],
  controller.updateFeesWaiver
);
feesWaiverRouter.delete('/:id', controller.deleteFeesWaiver);

module.exports = feesWaiverRouter;
