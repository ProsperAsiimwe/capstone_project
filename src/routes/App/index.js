const { Router } = require('express');
const metadataRouter = require('./metadata');
const metadataValueRouter = require('./metadataValue');
const institutionStructureRouter = require('./institutionStructureRoutes');
const documentSettingRouter = require('./documentSettingRoute');
const twoFactorAuthRouter = require('./twoFactorAuthRoute');
const { appController } = require('@controllers/index');
const loginRequired = require('@middleware/authRoute');

//  APP Module Endpoints
const appRouter = Router();

appRouter.get('/', [loginRequired], appController.index);
appRouter.use('/meta-data', [loginRequired], metadataRouter);
appRouter.use('/meta-data-values', [loginRequired], metadataValueRouter);
appRouter.use('/two-factor-auth', [loginRequired], twoFactorAuthRouter);
appRouter.use('/institution-structure', institutionStructureRouter);
appRouter.use('/document-settings', documentSettingRouter);
appRouter.use('/institution-setup', institutionStructureRouter);

module.exports = appRouter;
