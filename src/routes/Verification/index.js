const { Router } = require('express');

const verificationRouter = Router();
const registrationRoutes = require('./registrationRoutes');

verificationRouter.use('/registration', registrationRoutes);

module.exports = verificationRouter;
