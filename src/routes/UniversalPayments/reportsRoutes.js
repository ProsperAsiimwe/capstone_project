const express = require('express');
const { UniPayReportsController } = require('@controllers/UniversalPayments');
const uniPayReportsRouter = express.Router();

const reportController = new UniPayReportsController();

// report

uniPayReportsRouter.get('/', reportController.reportsFunction);

module.exports = uniPayReportsRouter;
