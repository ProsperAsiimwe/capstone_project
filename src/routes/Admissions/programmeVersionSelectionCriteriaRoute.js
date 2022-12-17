const express = require('express');
const {
  ProgrammeVersionSelectionCriteriaController,
} = require('@controllers/Admissions');
const {
  programmeVersionSelectionCriteriaValidator,
} = require('@validators/Admissions');

const programmeVersionSelectionCriteriaRouter = express.Router();
const controller = new ProgrammeVersionSelectionCriteriaController();

// ProgrammeVersionSelectionCriterias Routes.
programmeVersionSelectionCriteriaRouter.get('/', controller.index);

programmeVersionSelectionCriteriaRouter.post(
  '/',
  [
    programmeVersionSelectionCriteriaValidator.validateCreateProgrammeVersionSelectionCriteria,
  ],
  controller.createProgrammeVersionSelectionCriteria
);

programmeVersionSelectionCriteriaRouter.post(
  '/criteria-study-type',
  [
    programmeVersionSelectionCriteriaValidator.validateAddWeightingCriteriaStudyType,
  ],
  controller.addSelectionCriteriaStudyType
);

programmeVersionSelectionCriteriaRouter.get(
  '/:id',
  controller.fetchProgrammeVersionSelectionCriteria
);

programmeVersionSelectionCriteriaRouter.get(
  '/fetch-by-programme/:programmeId',
  controller.fetchProgrammeVersionSelectionCriteriaByProgramme
);

programmeVersionSelectionCriteriaRouter.put(
  '/:id',
  [
    programmeVersionSelectionCriteriaValidator.validateUpdateProgrammeVersionSelectionCriteria,
  ],
  controller.updateProgrammeVersionSelectionCriteria
);

// programmeVersionSelectionCriteriaRouter.put(
//   '/criteria-study-type/:id',
//   [
//     programmeVersionSelectionCriteriaValidator.validateUpdateWeightingCriteriaStudyType,
//   ],
//   controller.updateSelectionCriteriaStudyType
// );

programmeVersionSelectionCriteriaRouter.delete(
  '/:id',
  controller.deleteProgrammeVersionSelectionCriteria
);

module.exports = programmeVersionSelectionCriteriaRouter;
