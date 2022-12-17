const express = require('express');
const {
  OtherFeesAmountController,
  FeesElementController,
} = require('@controllers/FeesManager');
const { otherFeesAmountValidator } = require('@validators/FeesManager');

const otherFeesAmountRouter = express.Router();
const controller = new OtherFeesAmountController();
const feesElementController = new FeesElementController();

// Routes.
otherFeesAmountRouter.get('/', controller.index);

otherFeesAmountRouter.get('/filter', controller.filterOtherFeesAmounts);

otherFeesAmountRouter.get(
  '/other-fees-elements',
  controller.findOtherFeesElementsByView
);

otherFeesAmountRouter.post(
  '/',
  [otherFeesAmountValidator.validateCreateOtherFeesAmount],
  controller.createOtherFeesAmount
);

otherFeesAmountRouter.post(
  '/download-template',
  feesElementController.downloadOtherFeesAmountFeesElementTemplate
);

otherFeesAmountRouter.post(
  '/upload-template',
  controller.uploadOtherFeesAmountFeesElements
);

otherFeesAmountRouter.post(
  '/add-element-amounts/:otherFeesAmountId',
  [otherFeesAmountValidator.validateAddAmountElements],
  controller.addOtherFeesAmountFeesElement
);

otherFeesAmountRouter.put(
  '/update-element-amount/:id',
  [otherFeesAmountValidator.validateUpdateOtherFeesAmountElement],
  controller.updateOtherFeesAmountFeesElement
);

otherFeesAmountRouter.delete(
  '/delete-element-amount/:id',
  controller.deleteOtherFeesAmountFeesElement
);

otherFeesAmountRouter.post(
  '/approve',
  [otherFeesAmountValidator.validateApproveAmounts],
  controller.approveAmounts
);

otherFeesAmountRouter.get('/:id', controller.fetchOtherFeesAmount);

otherFeesAmountRouter.put(
  '/:id',
  [otherFeesAmountValidator.validateUpdateOtherFeesAmount],
  controller.updateOtherFeesAmount
);
otherFeesAmountRouter.delete('/:id', controller.deleteOtherFeesAmount);

module.exports = otherFeesAmountRouter;
