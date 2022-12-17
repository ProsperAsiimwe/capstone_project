const express = require('express');
const { ExemptedTuitionCampusController } = require('@controllers/FeesManager');
const { exemptedTuitionCampusValidator } = require('@validators/FeesManager');

const exemptedTuitionCampusRouter = express.Router();
const controller = new ExemptedTuitionCampusController();

// Events Management Routes.
exemptedTuitionCampusRouter.get('/', controller.index);

exemptedTuitionCampusRouter.post(
  '/',
  [exemptedTuitionCampusValidator.validateCreateExemptedTuitionCampuses],
  controller.createExemptedTuitionCampus
);

exemptedTuitionCampusRouter.get('/:id', controller.fetchExemptedTuitionCampus);

exemptedTuitionCampusRouter.delete(
  '/:id',
  controller.deleteExemptedTuitionCampus
);

module.exports = exemptedTuitionCampusRouter;
