const express = require('express');
const {
  ProgrammeController,
  SubjectCombinationController,
} = require('@controllers/index');
const { programmeValidator } = require('@validators/ProgrammeManager');

const programmeVersionSubjectCombinationRouter = express.Router();
const controller = new ProgrammeController();
const subjectCombinationController = new SubjectCombinationController();

// subject combination Routes.
programmeVersionSubjectCombinationRouter.get(
  '/categories/:programmeVersionId',
  controller.fetchProgrammeVersionSubjectCombinationCategories
);

programmeVersionSubjectCombinationRouter.post(
  '/:combinationCategoryId',
  [programmeValidator.validateProgrammeVersionSubjectCombination],
  controller.createProgrammeVersionSubjectCombination
);

programmeVersionSubjectCombinationRouter.put(
  '/:subjectCombinationId',
  [programmeValidator.validateProgrammeVersionSubjectCombination],
  subjectCombinationController.updateSubjectCombination
);

programmeVersionSubjectCombinationRouter.delete(
  '/:subjectCombinationId',
  subjectCombinationController.deleteSubjectCombination
);

module.exports = programmeVersionSubjectCombinationRouter;
