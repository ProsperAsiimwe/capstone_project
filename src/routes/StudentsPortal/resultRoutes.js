const express = require('express');
const { StudentResultsController } = require('@controllers/Result');

const resultsRouter = express.Router();
const studentResultsController = new StudentResultsController();

resultsRouter.get('/:id', studentResultsController.testimonialResultView);

module.exports = resultsRouter;
