const express = require('express');
const {
  ProgVersPlanAdmCriteriaController,
} = require('@controllers/ProgrammeManager');
const {
  progVersPlanAdmCriteriaValidator,
} = require('@validators/ProgrammeManager');

const progVersPlanAdmCriteriaRouter = express.Router();
const controller = new ProgVersPlanAdmCriteriaController();

// ProgVersPlanAdmCriteria Management Routes.
progVersPlanAdmCriteriaRouter.get('/', [], controller.index);

progVersPlanAdmCriteriaRouter.post(
  '/',
  [progVersPlanAdmCriteriaValidator.validateCreateProgVersPlanAdmCriteria],
  controller.createProgVersPlanAdmCriteria
);
progVersPlanAdmCriteriaRouter.get(
  '/:id',
  [],
  controller.fetchProgVersPlanAdmCriteria
);
progVersPlanAdmCriteriaRouter.put(
  '/:id',
  [progVersPlanAdmCriteriaValidator.validateCreateProgVersPlanAdmCriteria],
  controller.updateProgVersPlanAdmCriteria
);
progVersPlanAdmCriteriaRouter.delete(
  '/:id',
  controller.deleteProgVersPlanAdmCriteria
);

module.exports = progVersPlanAdmCriteriaRouter;
