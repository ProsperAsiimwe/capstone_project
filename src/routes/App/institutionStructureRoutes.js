const Router = require('express').Router();
const {
  InstitutionStructureController,
  ProgrammesReportsController,
} = require('@controllers/index');
const { institutionStructureValidator } = require('@validators/App');
const { authRoute: loginRequired } = require('@middleware');

const controller = new InstitutionStructureController();

const reportsController = new ProgrammesReportsController();

Router.get('/', controller.index);

Router.get('/student-portal', controller.structureForStudents);

Router.post(
  '/',
  [
    loginRequired,
    institutionStructureValidator.validateCreateInstitutionStructure,
  ],
  controller.createInstitutionStructure
);

Router.put(
  '/:id',
  [
    loginRequired,
    institutionStructureValidator.validateUpdateInstitutionStructure,
  ],
  controller.updateInstitutionStructure
);
Router.get('/report', reportsController.institutionReports);

Router.post('/upload-logo', [loginRequired], controller.newUploadLogo);
module.exports = Router;
