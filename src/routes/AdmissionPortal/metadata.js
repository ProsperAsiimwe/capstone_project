const Router = require('express').Router();
const { MetadataController } = require('@controllers/index');

const controller = new MetadataController();

// GET METADATA FOR APPLICANTS.
Router.get('/', controller.index);

module.exports = Router;
