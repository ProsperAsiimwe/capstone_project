const express = require('express');
const { FeesApprovalController } = require('@controllers/FeesManager');

const feesApprovalRouter = express.Router();
const controller = new FeesApprovalController();

// Routes.

feesApprovalRouter.get('/', controller.feesApprovalFunction);
feesApprovalRouter.get('/:fees_category', controller.feesApprovalFunction);

module.exports = feesApprovalRouter;
