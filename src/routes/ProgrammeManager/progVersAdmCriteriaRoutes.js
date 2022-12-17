const express = require('express');
const {
  ProgVersAdmCriteriaController,
} = require('@controllers/ProgrammeManager');
const {
  progVersAdmCriteriaValidator,
} = require('@validators/ProgrammeManager');

const progVersAdmCriteriaRouter = express.Router();
const controller = new ProgVersAdmCriteriaController();

// ProgVersAdmCriteria Management Routes.
progVersAdmCriteriaRouter.get('/', [], controller.index);
progVersAdmCriteriaRouter.post(
  '/',
  [progVersAdmCriteriaValidator.validateCreateProgVersAdmCriteria],
  controller.createProgVersAdmCriteria
);
progVersAdmCriteriaRouter.get('/:id', [], controller.fetchProgVersAdmCriteria);
progVersAdmCriteriaRouter.put(
  '/:id',
  [progVersAdmCriteriaValidator.validateCreateProgVersAdmCriteria],
  controller.updateProgVersAdmCriteria
);
progVersAdmCriteriaRouter.delete('/:id', controller.deleteProgVersAdmCriteria);

module.exports = progVersAdmCriteriaRouter;
