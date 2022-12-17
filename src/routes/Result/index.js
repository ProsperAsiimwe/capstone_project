const { Router } = require('express');
const loginRequired = require('../../app/middleware/authRoute');
// const studentLoginRequired = require('../../app/middleware/authRouteStudent');
const resultAllocationNodeRoutes = require('./resultAllocationNodeRoutes');
const resultRoutes = require('./resultRoutes');
const markUploadCourseRoutes = require('./markUploadCourseRoutes');
const graduationListRoutes = require('./graduationListRoutes');
const nodeQuestionRoutes = require('./nodeQuestionRoutes');
const reportsRoutes = require('./reportsRoutes');
const batchRoutes = require('./batchRoutes');
const senateReportsRoutes = require('./senateReportRoutes');

// API Endpoints
const resultsMgtRouter = Router();

resultsMgtRouter.use('/nodes', [loginRequired], resultAllocationNodeRoutes);

resultsMgtRouter.use('/nodes-questions', [loginRequired], nodeQuestionRoutes);

resultsMgtRouter.use('/results', [loginRequired], resultRoutes);
resultsMgtRouter.use('/graduation', [loginRequired], graduationListRoutes);
resultsMgtRouter.use('/reports', [loginRequired], reportsRoutes);
resultsMgtRouter.use('/batch', [loginRequired], batchRoutes);
resultsMgtRouter.use('/senate-reports', [loginRequired], senateReportsRoutes);

resultsMgtRouter.use(
  '/upload-courses',
  [loginRequired],
  markUploadCourseRoutes
);

module.exports = resultsMgtRouter;
