const { Router } = require('express');
const loginRequired = require('../../app/middleware/authRoute');

const applicantRoutes = require('../PujabPortal');
const institutionRouter = require('./institutionRoutes');
const programmeRouter = require('./programmeRoutes');
const applicationRouter = require('./applicationRoutes');
const unebDataRouter = require('./unebDataRoutes');

const pujabRouter = Router();

pujabRouter.use('/applicant-portal', applicantRoutes);
pujabRouter.use('/institutions', [loginRequired], institutionRouter);
pujabRouter.use('/programmes', [loginRequired], programmeRouter);
pujabRouter.use('/running-admissions', [loginRequired], applicationRouter);
pujabRouter.use('/uneb-report', [loginRequired], unebDataRouter);

module.exports = pujabRouter;
