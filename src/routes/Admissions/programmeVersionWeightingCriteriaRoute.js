const express = require('express');
const {
  ProgrammeVersionWeightingCriteriaController,
} = require('@controllers/Admissions');
const {
  programmeVersionWeightingCriteriaValidator,
} = require('@validators/Admissions');

const programmeVersionWeightingCriteriaRouter = express.Router();
const controller = new ProgrammeVersionWeightingCriteriaController();

// ProgrammeVersionWeightingCriterias Routes.
programmeVersionWeightingCriteriaRouter.get('/', controller.index);

programmeVersionWeightingCriteriaRouter.post(
  '/',
  [
    programmeVersionWeightingCriteriaValidator.validateCreateProgrammeVersionWeightingCriteria,
  ],
  controller.createProgrammeVersionWeightingCriteria
);

programmeVersionWeightingCriteriaRouter.post(
  '/add-new-category',
  [
    programmeVersionWeightingCriteriaValidator.validateAddWeightingCriteriaCategory,
  ],
  controller.addWeightingCriteriaCategory
);

programmeVersionWeightingCriteriaRouter.post(
  '/add-category-subjects',
  [
    programmeVersionWeightingCriteriaValidator.validateAddWeightingCriteriaCategorySubjects,
  ],
  controller.addWeightingCriteriaCategorySubjects
);

programmeVersionWeightingCriteriaRouter.get(
  '/:id',
  controller.fetchProgrammeVersionWeightingCriteria
);

programmeVersionWeightingCriteriaRouter.get(
  '/fetch-by-programme/:programmeId',
  controller.fetchProgrammeVersionWeightingCriteriaByProgramme
);

programmeVersionWeightingCriteriaRouter.put(
  '/:id',
  [
    programmeVersionWeightingCriteriaValidator.validateUpdateProgrammeVersionWeightingCriteria,
  ],
  controller.updateProgrammeVersionWeightingCriteria
);

programmeVersionWeightingCriteriaRouter.put(
  '/update-criteria-category/:criteriaCategoryId',
  [
    programmeVersionWeightingCriteriaValidator.validateUpdateWeightingCriteriaCategory,
  ],
  controller.updateWeightingCriteriaCategory
);

programmeVersionWeightingCriteriaRouter.delete(
  '/delete-criteria-category/:criteriaCategoryId',
  controller.deleteWeightingCriteriaCategory
);

programmeVersionWeightingCriteriaRouter.delete(
  '/:id',
  controller.deleteProgrammeVersionWeightingCriteria
);

module.exports = programmeVersionWeightingCriteriaRouter;
