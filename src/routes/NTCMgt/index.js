const { Router } = require('express');
const NTCStudentRouter = require('./NTCStudentRouter');
const NTCResultRouter = require('./NTCResultRouter');
const NTCSubjectRouter = require('./NTCSubjectRouter');

const appRouter = Router();

appRouter.use('/ntc-students', NTCStudentRouter);
appRouter.use('/ntc-subjects', NTCSubjectRouter);
appRouter.use('/ntc-results', NTCResultRouter);

module.exports = appRouter;
