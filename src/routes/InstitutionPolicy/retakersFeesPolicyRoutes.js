const express = require('express');
const {
  RetakersFeesPolicyController,
} = require('@controllers/InstitutionPolicy');
const {
  retakersFeesPolicyValidator,
} = require('@validators/InstitutionPolicy');

const retakersFeesPolicyRouter = express.Router();
const controller = new RetakersFeesPolicyController();

retakersFeesPolicyRouter.post(
  '/',
  [retakersFeesPolicyValidator.validateCreateRetakersFeesPolicy],
  controller.createRecord
);

retakersFeesPolicyRouter.post(
  '/add-more-elements/:retakers_fees_policy_id',
  [retakersFeesPolicyValidator.validateAddNewRetakersFeesPolicyElements],
  controller.addElementsToPolicyRecord
);

retakersFeesPolicyRouter.put(
  '/:id',
  [retakersFeesPolicyValidator.validateUpdateRetakersFeesPolicy],
  controller.updateRecord
);

retakersFeesPolicyRouter.get('/', controller.index);

retakersFeesPolicyRouter.delete('/:id', controller.deleteRecord);

retakersFeesPolicyRouter.delete(
  '/delete-elements/:id',
  [retakersFeesPolicyValidator.validateDeleteRetakersFeesPolicyElements],
  controller.deleteMultipleElements
);

module.exports = retakersFeesPolicyRouter;
