const express = require('express');
const { feesCopyValidator } = require('@validators/FeesManager');
const {
  FeesAmountPreviewController,
  FeesStructureController,
  FeesCopyController,
} = require('@controllers/FeesManager');

const feesAmountPreviewRoute = express.Router();

const controller = new FeesAmountPreviewController();
const feesStructureController = new FeesStructureController();
const feesCopyController = new FeesCopyController();

// Routes.

feesAmountPreviewRoute.post('/', controller.feesAmountPreviewByHandler);

feesAmountPreviewRoute.get(
  '/fees-structure/:studentProgrammeId',
  feesStructureController.feesStructure
);
feesAmountPreviewRoute.get(
  '/fees/:studentProgrammeId',
  feesStructureController.studentPortalFeesStructure
);

feesAmountPreviewRoute.post(
  '/fees-copy/create',
  [feesCopyValidator.validateCreateFeesCopy],
  feesCopyController.feesCopyHandler
);
module.exports = feesAmountPreviewRoute;
