/***


const express = require('express');
const { ClientController } = require('@controllers/Api');

const authRouter = express.Router();
const controller = new ClientController();

authRouter.post('/', controller.clientLogin);

module.exports = authRouter;


*/
