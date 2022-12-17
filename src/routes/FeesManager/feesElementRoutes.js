const express = require('express');
const { FeesElementController } = require('@controllers/FeesManager');
const { feesElementValidator } = require('@validators/FeesManager');

const feesElementRouter = express.Router();
const controller = new FeesElementController();

// Events Management Routes.
feesElementRouter.get('/', controller.index);

feesElementRouter.post(
  '/',
  [feesElementValidator.validateCreateFeesElement],
  controller.createFeesElement
);
feesElementRouter.post(
  '/download-template',
  controller.downloadFeesElementTemplate
);

feesElementRouter.post(
  '/bill-functional-fees',
  controller.downloadFeesElementTemplate
);

feesElementRouter.post('/upload-template', controller.uploadFeesElements);

feesElementRouter.get('/:id', controller.fetchFeesElement);
feesElementRouter.put('/:id', controller.updateFeesElement);
feesElementRouter.delete('/:id', controller.deleteFeesElement);

feesElementRouter.get(
  '/all-fees-elements-with-amounts/:student_id',
  controller.fetchAllFeesElementsWithTheirAmounts
);

module.exports = feesElementRouter;
