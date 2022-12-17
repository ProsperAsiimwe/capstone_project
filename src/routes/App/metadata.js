const Router = require('express').Router();
const { MetadataController } = require('@controllers/index');
const { metadata } = require('@validators/App');

const controller = new MetadataController();

// All Meta Data ROutes.
Router.get('/', controller.index);
Router.post('/', [metadata.validateCreateMetadata], controller.createMetadata);
Router.get('/:id', controller.fetchMetadata);
Router.put(
  '/:id',
  // [metadata.validateCreateMetadata],
  controller.updateMetadata
);
Router.delete('/:id', controller.deleteMetadata);

module.exports = Router;
