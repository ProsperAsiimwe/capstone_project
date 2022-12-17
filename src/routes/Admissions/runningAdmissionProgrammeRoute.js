const express = require('express');
const {
  RunningAdmissionProgrammeController,
} = require('@controllers/Admissions');
const {
  runningAdmissionProgrammeValidator,
} = require('@validators/Admissions');

const runningAdmissionProgrammeRouter = express.Router();
const controller = new RunningAdmissionProgrammeController();

// RunningAdmissionProgrammes Routes.
runningAdmissionProgrammeRouter.get('/', controller.index);

// runningAdmissionProgrammeByContext
runningAdmissionProgrammeRouter.get(
  '/programmes',
  controller.runningAdmissionProgrammeByContext
);

//  programmeCampusesByContext

runningAdmissionProgrammeRouter.get(
  '/programmes-context',
  controller.programmeCampusesByContext
);

runningAdmissionProgrammeRouter.post(
  '/',
  [runningAdmissionProgrammeValidator.validateCreateRunningAdmissionProgramme],
  controller.createRunningAdmissionProgramme
);

runningAdmissionProgrammeRouter.post(
  '/download-template/:runningAdmissionId',
  controller.downloadManageMultipleRunningAdmissionProgrammesTemplate
);

runningAdmissionProgrammeRouter.post(
  '/upload-template/:runningAdmissionId',
  controller.uploadManageMultipleRunningAdmissionProgrammesTemplate
);

runningAdmissionProgrammeRouter.get(
  '/:id',
  controller.fetchRunningAdmissionProgramme
);
runningAdmissionProgrammeRouter.put(
  '/:id',
  [runningAdmissionProgrammeValidator.validateUpdateRunningAdmissionProgramme],
  controller.updateRunningAdmissionProgramme
);

runningAdmissionProgrammeRouter.put(
  '/activate/:runningAdmissionProgrammeId',
  controller.activateProgramme
);

runningAdmissionProgrammeRouter.put(
  '/de-activate/:runningAdmissionProgrammeId',
  controller.deactivateProgramme
);

runningAdmissionProgrammeRouter.put(
  '/add-weighting-criteria/:runningAdmissionProgrammeId/:weightingCriteriaId',
  controller.addWeightingCriteria
);

runningAdmissionProgrammeRouter.put(
  '/add-selection-criteria/:runningAdmissionProgrammeId/:selectionCriteriaId',
  controller.addSelectionCriteria
);

runningAdmissionProgrammeRouter.delete(
  '/:id',
  controller.hardDeleteRunningAdmissionProgramme
);

runningAdmissionProgrammeRouter.put(
  '/soft-delete/:id',
  controller.softDeleteRunningAdmissionProgramme
);

runningAdmissionProgrammeRouter.put(
  '/restore/:id',
  controller.undoSoftDeleteRunningAdmissionProgramme
);

module.exports = runningAdmissionProgrammeRouter;
