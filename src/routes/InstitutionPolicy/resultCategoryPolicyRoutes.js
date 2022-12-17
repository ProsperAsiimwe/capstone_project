const express = require('express');
const {
  ResultCategoryPolicyController,
} = require('@controllers/InstitutionPolicy');
const {
  resultCategoryPolicyValidator,
} = require('@validators/InstitutionPolicy');

const resultCategoryPolicyRouter = express.Router();
const controller = new ResultCategoryPolicyController();

resultCategoryPolicyRouter.get('/', controller.index);

resultCategoryPolicyRouter.post(
  '/',
  [resultCategoryPolicyValidator.validateCreateResultCategoryPolicy],
  controller.createResultCategoryPolicy
);

resultCategoryPolicyRouter.get(
  '/:studyLevelResultCategoryId',
  controller.fetchOne
);

resultCategoryPolicyRouter.put(
  '/:studyLevelResultCategoryId',
  [resultCategoryPolicyValidator.validateCreateResultCategoryPolicy],
  controller.updateResultCategoryPolicy
);

resultCategoryPolicyRouter.put(
  '/update-policy-item/:resultCategoryPolicyItemId',
  [resultCategoryPolicyValidator.validateUpdateResultCategoryPolicyItem],
  controller.updateResultCategoryPolicyItem
);

resultCategoryPolicyRouter.delete(
  '/:id',
  controller.deleteResultCategoryPolicy
);

resultCategoryPolicyRouter.delete(
  '/remove-policy-item/:resultCategoryPolicyItemId',
  controller.deleteResultCategoryPolicyItem
);

module.exports = resultCategoryPolicyRouter;
