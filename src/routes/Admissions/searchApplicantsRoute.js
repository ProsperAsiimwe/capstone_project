const express = require('express');
const { SearchApplicantController } = require('@controllers/Admissions');

const searchRouter = express.Router();
const controller = new SearchApplicantController();

searchRouter.get('/', controller.searchApplicant);

module.exports = searchRouter;
