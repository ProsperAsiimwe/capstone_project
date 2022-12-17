const Router = require('express').Router();
const { MetadataValueController } = require('@controllers/index');
const { metadata } = require('@validators/App');

const valueController = new MetadataValueController();

// STATIC Parameter Value API Routes.
Router.get('/', valueController.index);
Router.post(
  '/',
  [metadata.validateCreateMetadataValue],
  valueController.createMetadataValue
);
Router.get('/:id', valueController.fetchMetadataValue);
Router.put(
  '/:id',
  // [staticParameter.validateCreateMetadataValue],
  valueController.updateMetadataValue
);
Router.delete('/:id', valueController.deleteMetadataValue);

module.exports = Router;
