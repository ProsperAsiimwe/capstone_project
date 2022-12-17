const express = require('express');
const { ResultController } = require('@controllers/Result');

const { resultValidator } = require('@validators/Results');

const resultRouter = express.Router();
const controller = new ResultController();

resultRouter.get('/', controller.index);

resultRouter.get('/user-logs', controller.loggedInUserLogs);

// resultRouter.post(
//   '/',
//   [resultValidator.validateBulkUploadResults],
//   controller.createResult
// );

resultRouter.post(
  '/download-template',
  controller.downloadDirectMarksUploadTemplate
);

resultRouter.post(
  '/download-academic-assessment-template',
  controller.downloadStudentAssessmentTemplate
);

resultRouter.post(
  '/download-results-view',
  controller.downloadResultsViewTemplate
);

resultRouter.post(
  '/download-results-report',
  controller.downloadResultsViewTemplate
);

resultRouter.post(
  '/upload-dissertations',
  controller.uploadDissertationTemplate
);

resultRouter.post(
  '/download-dissertation-template',
  controller.downloadDissertationTemplate
);

resultRouter.put('/round-off-results', controller.roundOffResults);

resultRouter.post(
  '/upload-template/:otp/:operation',
  controller.uploadDirectMarksUploadTemplate
);

resultRouter.post(
  '/upload-academic-assessment-template/:otp/:operation',
  controller.uploadStudentAcademicAssessmentTemplate
);

resultRouter.put(
  '/:id',
  [resultValidator.validateUpdateResults],
  controller.updateResult
);

resultRouter.put(
  '/update/academic-years',
  [resultValidator.validateUpdateResultAcademicYear],
  controller.updateResultAcademicYear
);

resultRouter.delete(
  '/:id',
  [resultValidator.validateResultsTwoFA],
  controller.deleteResult
);

module.exports = resultRouter;
