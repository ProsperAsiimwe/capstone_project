const express = require('express');
const { NodeQuestionController } = require('@controllers/Result');

const { nodeQuestionValidator } = require('@validators/Results');

const nodeQuestionRouter = express.Router();
const controller = new NodeQuestionController();

nodeQuestionRouter.post(
  '/:nodeId',
  [nodeQuestionValidator.validateCreateNodeQuestion],
  controller.createNodeQuestion
);

nodeQuestionRouter.get('/all-node-questions/:nodeId', controller.index);

nodeQuestionRouter.put('/:nodeQuestionId', controller.updateNodeQuestion);

nodeQuestionRouter.delete('/:nodeQuestionId', controller.deleteNodeQuestion);

module.exports = nodeQuestionRouter;
