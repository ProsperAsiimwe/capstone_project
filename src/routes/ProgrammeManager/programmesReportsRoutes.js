const express = require('express');
const {
  ProgrammesReportsController,
} = require('@controllers/ProgrammeManager');

const programmesReportsRouter = express.Router();

const controller = new ProgrammesReportsController();

// students records

programmesReportsRouter.get('/', controller.programmesReports);

module.exports = programmesReportsRouter;
