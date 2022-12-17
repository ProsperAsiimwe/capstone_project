const Router = require('express').Router();
const { MetadataController } = require('@controllers/index');

const controller = new MetadataController();

// GET METADATA FOR STUDENTS.
Router.get('/', controller.getMetadataForStudents);

module.exports = Router;
