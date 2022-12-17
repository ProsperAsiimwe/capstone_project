const express = require('express');
const { SubjectCombinationController } = require('@controllers/index');
const { subjectCombinationValidator } = require('@validators/ProgrammeManager');
const { courseUnitValidator } = require('@validators/ProgrammeManager');

const subjectCombinationRouter = express.Router();
const controller = new SubjectCombinationController();

subjectCombinationRouter.get('/', controller.index);

//  versionSubjectCombinationFunction

subjectCombinationRouter.get(
  '/with-programmes',
  controller.getCombinationsWithProgram
);

subjectCombinationRouter.get(
  '/version-subject-combination',
  controller.versionSubjectCombinationFunction
);

subjectCombinationRouter.post(
  '/',
  // [subjectCombinationValidator.validateCreateSubjectCombination],
  controller.createSubjectCombination
);
subjectCombinationRouter.get('/:id', controller.fetchSubjectCombination);
subjectCombinationRouter.put(
  '/:id',
  // [subjectCombinationValidator.validateCreateSubjectCombination],
  controller.updateSubjectCombination
);

subjectCombinationRouter.delete('/:id', controller.deleteSubjectCombination);

// Add course-units to subjects
subjectCombinationRouter.post(
  '/add-course-unit/:subjectCombinationSubjectId',
  [courseUnitValidator.validateCourseUnitToSubject],
  controller.addCourseUnit
);

// delete subject course unit
subjectCombinationRouter.delete(
  '/delete-course-unit/:subjectCourseUnitId',
  controller.deleteSubjectCourseUnit
);

module.exports = subjectCombinationRouter;
