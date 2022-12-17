const express = require('express');
const {
  FunctionalFeesAmountController,
  FeesElementController,
} = require('@controllers/FeesManager');
const { functionalFeesAmountValidator } = require('@validators/FeesManager');

const functionalFeesAmountRouter = express.Router();
const controller = new FunctionalFeesAmountController();
const feesElementController = new FeesElementController();

// Routes.
functionalFeesAmountRouter.get('/', controller.index);
functionalFeesAmountRouter.post(
  '/functional-fees-elements-amounts',
  controller.findFunctionalFeesByContext
);

functionalFeesAmountRouter.get(
  '/functional-fees-elements',
  controller.findFunctionalFeesElementsByView
);
functionalFeesAmountRouter.post(
  '/uniq-fees-amounts',
  controller.fetchUniqFunctionalFeesAmount
);

functionalFeesAmountRouter.post(
  '/bulk-create',
  [functionalFeesAmountValidator.validateCreateFunctionalFeesAmount],
  controller.bulkCreateAmounts
);
functionalFeesAmountRouter.post(
  '/uniq-create',
  controller.createUniqueFeesAmounts
);

functionalFeesAmountRouter.post(
  '/uniq-update',
  controller.approveUniqFunctionalFees
);

functionalFeesAmountRouter.post(
  '/download-template',
  feesElementController.downloadFunctionalAmountFeesElementTemplate
);

functionalFeesAmountRouter.post(
  '/upload-template',
  controller.uploadFunctionalAmountFeesElements
);

functionalFeesAmountRouter.post(
  '/add-element-amounts/:functionalFeesAmountId',
  [functionalFeesAmountValidator.validateAddAmountElements],
  controller.addFunctionalAmountFeesElement
);

functionalFeesAmountRouter.put(
  '/update-element-amount/:id',
  [functionalFeesAmountValidator.validateUpdateFunctionalAmountElements],
  controller.updateFunctionalFeesAmountFeesElement
);

functionalFeesAmountRouter.delete(
  '/delete-element-amount/:id',
  controller.deleteFunctionalFeesAmountFeesElement
);

functionalFeesAmountRouter.post(
  '/approve',
  [functionalFeesAmountValidator.validateApproveAmounts],
  controller.approveAmounts
);
functionalFeesAmountRouter.get('/:id', controller.fetchFunctionalFeesAmount);
functionalFeesAmountRouter.put(
  '/:id',
  [functionalFeesAmountValidator.validateUpdateFunctionalFeesAmount],
  controller.updateFunctionalFeesAmount
);
functionalFeesAmountRouter.delete(
  '/:id',
  controller.deleteFunctionalFeesAmount
);

module.exports = functionalFeesAmountRouter;
