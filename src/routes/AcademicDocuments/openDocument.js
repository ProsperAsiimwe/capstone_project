const { PrintDocumentController } = require('@controllers/index');
const { Router } = require('express');

const openDocumentRoute = Router();

const controller = new PrintDocumentController();

openDocumentRoute.get('/print/view/:category/:name', controller.viewDocument);

module.exports = openDocumentRoute;
