const express = require('express');
const {
  ProgrammeVersionPlanAdmissionCriteriaController,
} = require('@controllers/Admissions');
const {
  programmeVersionPlanAdmissionCriteriaValidator,
} = require('@validators/Admissions');

const programmeVersionPlanAdmissionCriteriaRouter = express.Router();
const controller = new ProgrammeVersionPlanAdmissionCriteriaController();

// ProgrammeVersionPlanAdmissionCriterias Routes.
programmeVersionPlanAdmissionCriteriaRouter.get('/', controller.index);

programmeVersionPlanAdmissionCriteriaRouter.post(
  '/',
  [
    programmeVersionPlanAdmissionCriteriaValidator.validateCreateProgrammeVersionPlanAdmissionCriteria,
  ],
  controller.createProgrammeVersionPlanAdmissionCriteria
);
programmeVersionPlanAdmissionCriteriaRouter.get(
  '/:id',
  controller.fetchProgrammeVersionPlanAdmissionCriteria
);
programmeVersionPlanAdmissionCriteriaRouter.put(
  '/:id',
  [
    programmeVersionPlanAdmissionCriteriaValidator.validateUpdateProgrammeVersionPlanAdmissionCriteria,
  ],
  controller.updateProgrammeVersionPlanAdmissionCriteria
);
programmeVersionPlanAdmissionCriteriaRouter.delete(
  '/:id',
  controller.hardDeleteProgrammeVersionPlanAdmissionCriteria
);

programmeVersionPlanAdmissionCriteriaRouter.put(
  '/soft-delete/:id',
  controller.softDeleteProgrammeVersionPlanAdmissionCriteria
);

programmeVersionPlanAdmissionCriteriaRouter.put(
  '/restore/:id',
  controller.undoSoftDeleteProgrammeVersionPlanAdmissionCriteria
);

module.exports = programmeVersionPlanAdmissionCriteriaRouter;
