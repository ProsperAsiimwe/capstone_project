const { Router } = require('express');
const MailRouter = require('./mail');

const mailRouter = Router();

mailRouter.use('/email', MailRouter);

module.exports = mailRouter;
