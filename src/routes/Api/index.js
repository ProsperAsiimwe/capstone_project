const { Router } = require('express');
const loginRequired = require('../../app/middleware/authRoute');
// const apiAccessRequired = require('../../app/middleware/apiAuth');

// emis endpoints
const clientRouter = Router();
const courseRoutes = require('./courseRoute');

clientRouter.use('/courses', [loginRequired], courseRoutes);

// clientRouter.use('/acmis', [apiAccessRequired], universityRoutes);

module.exports = clientRouter;
