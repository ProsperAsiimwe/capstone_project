const express = require('express');
const { SenateReportsController } = require('@controllers/Result');

const senateReportsRouter = express.Router();

const { graduationListValidator } = require('@validators/Results');

const controller = new SenateReportsController();
// graduationList

senateReportsRouter.get('/', controller.reportByAcademicUnit);

senateReportsRouter.get('/senate', controller.senateResultReport);

senateReportsRouter.post(
  '/generate-senate-report',
  [graduationListValidator.validateGenerateSenateReport],
  controller.generateSenateReport
);

module.exports = senateReportsRouter;
