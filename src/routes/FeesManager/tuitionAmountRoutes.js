const express = require('express');
const {
  TuitionAmountController,
  FeesElementController,
} = require('@controllers/FeesManager');
const { tuitionAmountValidator } = require('@validators/FeesManager');

const tuitionAmountRouter = express.Router();
const controller = new TuitionAmountController();
const feesElementController = new FeesElementController();

// Routes.
tuitionAmountRouter.get('/', controller.index);
tuitionAmountRouter.post(
  '/fees-elements-amounts',
  controller.findTuitionByContext
);

tuitionAmountRouter.post(
  '/bulk-create',
  [tuitionAmountValidator.validateCreateTuitionAmount],
  controller.bulkCreateAmounts
);

tuitionAmountRouter.post(
  '/download-template',
  feesElementController.downloadTuitionAmountFeesElementTemplate
);

tuitionAmountRouter.post(
  '/upload-template',
  controller.uploadTuitionAmountFeesElements
);

tuitionAmountRouter.post(
  '/add-element-amounts/:tuitionAmountId',
  [tuitionAmountValidator.validateAddTuitionAmountElements],
  controller.addTuitionAmountFeesElement
);

tuitionAmountRouter.put(
  '/update-element-amount/:id',
  [tuitionAmountValidator.validateUpdateTuitionAmountElement],
  controller.updateTuitionAmountFeesElement
);
tuitionAmountRouter.delete(
  '/delete-element-amount/:id',
  controller.deleteTuitionAmountFeesElement
);

tuitionAmountRouter.post(
  '/approve',
  [tuitionAmountValidator.validateApproveAmounts],
  controller.approveAmounts
);

tuitionAmountRouter.put(
  '/:id',
  [tuitionAmountValidator.validateUpdateTuitionAmount],
  controller.updateTuitionAmount
);

tuitionAmountRouter.get('/:id', controller.fetchTuitionAmount);

tuitionAmountRouter.delete('/:id', controller.deleteTuitionAmount);

module.exports = tuitionAmountRouter;
