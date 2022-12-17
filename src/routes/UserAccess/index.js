const { Router } = require('express');
const appsRouter = require('./appsRoute');
const appFunctionRouter = require('./appFunctionRoute');
const userRouter = require('./usersRoute');
const securityProfileRouter = require('./securityProfileRoute');
const userRoleGroupRouter = require('./userRoleGroupRoute');
const userRoleRouter = require('./roleRoutes');
const roleProfileRouter = require('./roleProfile');

const userMgtRouter = Router();

// create and fetch users route
userMgtRouter.use('/user-data', userRouter);
userMgtRouter.use('/security-profiles', securityProfileRouter);
userMgtRouter.use('/user-roles', userRoleRouter);
userMgtRouter.use('/apps', appsRouter);
userMgtRouter.use('/app-functions', appFunctionRouter);
userMgtRouter.use('/user-role-groups', userRoleGroupRouter);
userMgtRouter.use('/role-profiles', roleProfileRouter);

module.exports = userMgtRouter;
