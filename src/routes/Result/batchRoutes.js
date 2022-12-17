const express = require('express');
const {
  BatchController,
  ResultApprovalController,
} = require('@controllers/Result');

const batchRouter = express.Router();

const batchController = new BatchController();
const approveResultsController = new ResultApprovalController();

const { resultValidator } = require('@validators/Results');

batchRouter.get('/', batchController.BatchFunction);

batchRouter.get('/range', batchController.BatchRangeFunction);

batchRouter.get('/search-batch', batchController.searchUserResultBatch);

batchRouter.get('/batch-approval', batchController.resultBatchApproval);
batchRouter.get('/approval-courses', batchController.approvalPublishCourses);
batchRouter.get('/approval-results', batchController.approvalPublishResults);

batchRouter.get('/results', batchController.resultsByBatchFunction);

// result submit
batchRouter.post('/submit-batch', approveResultsController.submitResultByBatch);

batchRouter.post('/approve-batch', batchController.approvalResultByBatch);

batchRouter.post(
  '/approve-result',
  [resultValidator.validateApproveResultCreation],
  batchController.approvalResultNotByBatch
);

batchRouter.post(
  '/publish-result',
  [resultValidator.validateApproveResultCreation],
  batchController.publishResultNotByBatch
);

batchRouter.post(
  '/submit-result',
  [resultValidator.validateApproveResultCreation],
  approveResultsController.submitSelectedResults
);

batchRouter.post('/compute-batch/:batchNumber', batchController.computeBatch);

batchRouter.put(
  '/update-batch/:batchNumber',
  [resultValidator.validateUpdateBatch],
  batchController.updateBatch
);
batchRouter.put(
  '/update-batch-record/:batchResultContextId',
  [resultValidator.validateUpdateBatchRecord],
  batchController.updateBatchRecord
);

batchRouter.delete(
  '/delete-batch/:batchNumber',
  [resultValidator.validateResultsTwoFA],
  batchController.deleteBatch
);

batchRouter.get(
  '/download-batch/:batchNumber',
  batchController.downloadResultsByBatchFunction
);

batchRouter.delete(
  '/delete-batch-record/:batchResultContextId',
  [resultValidator.validateResultsTwoFA],
  batchController.deleteBatchRecord
);

module.exports = batchRouter;
