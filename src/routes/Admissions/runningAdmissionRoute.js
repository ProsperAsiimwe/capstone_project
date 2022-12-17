const express = require('express');
const { RunningAdmissionController } = require('@controllers/Admissions');
const { runningAdmissionValidator } = require('@validators/Admissions');

const runningAdmissionRouter = express.Router();
const controller = new RunningAdmissionController();

// RunningAdmissions Routes.
runningAdmissionRouter.get('/', controller.index);

runningAdmissionRouter.post(
  '/',
  [runningAdmissionValidator.validateCreateRunningAdmission],
  controller.createRunningAdmission
);
runningAdmissionRouter.post(
  '/manage-applicants-context',
  controller.findApplicantsByContext
);
runningAdmissionRouter.post(
  '/download-selected-applicants/:runningAdmissionId',
  controller.downloadSelectedApplicants
);
runningAdmissionRouter.get(
  '/:runningAdmissionId',
  controller.fetchRunningAdmission
);
runningAdmissionRouter.put(
  '/:id',
  [runningAdmissionValidator.validateUpdateRunningAdmission],
  controller.updateRunningAdmission
);
runningAdmissionRouter.delete('/:id', controller.hardDeleteRunningAdmission);

runningAdmissionRouter.put(
  '/soft-delete/:id',
  controller.softDeleteRunningAdmission
);

runningAdmissionRouter.put(
  '/restore/:id',
  controller.undoSoftDeleteRunningAdmission
);

runningAdmissionRouter.put('/start/:id', controller.activateOnlineApplications);
runningAdmissionRouter.put(
  '/stop/:id',
  controller.deactivateOnlineApplications
);

module.exports = runningAdmissionRouter;
