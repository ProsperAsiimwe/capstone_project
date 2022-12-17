const express = require('express');
const {
  FeesWaiverDiscountController,
  FeesElementController,
} = require('@controllers/FeesManager');
const { feesWaiverDiscountValidator } = require('@validators/FeesManager');

const feesWaiverDiscountRouter = express.Router();
const controller = new FeesWaiverDiscountController();
const feesElementController = new FeesElementController();

// Routes.
feesWaiverDiscountRouter.get('/', controller.index);

feesWaiverDiscountRouter.post(
  '/',
  [feesWaiverDiscountValidator.validateCreateFeesWaiverDiscount],
  controller.createFeesWaiverDiscount
);

feesWaiverDiscountRouter.post(
  '/download-template',
  feesElementController.downloadFeesWaiverDiscountFeesElementTemplate
);

feesWaiverDiscountRouter.post(
  '/upload-template',
  controller.uploadFeesWaiverDiscountFeesElements
);

feesWaiverDiscountRouter.post(
  '/add-element-amounts/:feesWaiverId',
  [feesWaiverDiscountValidator.validateAddDiscountedElements],
  controller.addDiscountedElement
);

feesWaiverDiscountRouter.put(
  '/update-element-amount/:id',
  [feesWaiverDiscountValidator.validateUpdateDiscountedElements],
  controller.updateDiscountedFeesElement
);

feesWaiverDiscountRouter.delete(
  '/delete-element-amount/:id',
  controller.deleteDiscountedFeesElement
);

feesWaiverDiscountRouter.post(
  '/approve',
  [feesWaiverDiscountValidator.validateApproveAmounts],
  controller.approveFeesWaiverDiscountFeesAmount
);
feesWaiverDiscountRouter.get('/:id', controller.fetchFeesWaiverDiscount);
feesWaiverDiscountRouter.put(
  '/:id',
  [feesWaiverDiscountValidator.validateUpdateFeesWaiverDiscount],
  controller.updateFeesWaiverDiscount
);
feesWaiverDiscountRouter.delete('/:id', controller.deleteFeesWaiverDiscount);

feesWaiverDiscountRouter.get(
  '/fees-elements/filter',
  controller.filterFeesWaiverDiscounts
);

module.exports = feesWaiverDiscountRouter;
