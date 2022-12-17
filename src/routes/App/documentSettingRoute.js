const Router = require('express').Router();
const { DocumentSettingController } = require('@controllers/index');
const { authRoute: loginRequired } = require('@middleware');

const controller = new DocumentSettingController();

Router.get('/', [loginRequired], controller.index);
Router.get('/preview/:category', [loginRequired], controller.previewDocument);

Router.post('/', [loginRequired], controller.uploadSignature);

Router.put('/:id', [loginRequired], controller.updateInstitutionStructure);

module.exports = Router;
