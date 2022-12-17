const express = require('express');
const {
  GraduateFeesPolicyController,
} = require('@controllers/InstitutionPolicy');
const {
  graduateFeesPolicyValidator,
} = require('@validators/InstitutionPolicy');

const graduateFeesPolicyRouter = express.Router();
const controller = new GraduateFeesPolicyController();

graduateFeesPolicyRouter.post(
  '/',
  [graduateFeesPolicyValidator.validateCreateGraduateFeesPolicy],
  controller.createRecord
);

graduateFeesPolicyRouter.post(
  '/add-more-elements/:graduate_fees_policy_id',
  [graduateFeesPolicyValidator.validateAddNewGraduateFeesPolicyElements],
  controller.addElementsToPolicyRecord
);

graduateFeesPolicyRouter.put(
  '/:id',
  [graduateFeesPolicyValidator.validateUpdateGraduateFeesPolicy],
  controller.updateRecord
);

graduateFeesPolicyRouter.get('/', controller.index);

graduateFeesPolicyRouter.delete('/:id', controller.deleteRecord);

graduateFeesPolicyRouter.delete(
  '/delete-elements/:id',
  [graduateFeesPolicyValidator.validateDeleteGraduateFeesPolicyElements],
  controller.deleteMultipleElements
);

module.exports = graduateFeesPolicyRouter;
