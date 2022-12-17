const express = require('express');
const {
  RunningAdmissionProgrammeCampusController,
} = require('@controllers/Admissions');
const {
  runningAdmissionProgrammeCampusValidator,
} = require('@validators/Admissions');

const runningAdmissionProgrammeCampusRouter = express.Router();
const controller = new RunningAdmissionProgrammeCampusController();

// RunningAdmissionProgrammeCampus Routes.

runningAdmissionProgrammeCampusRouter.get(
  '/running-admission-programme-campus',
  controller.findRunningAdmissionProgrammeCampusContext
);

runningAdmissionProgrammeCampusRouter.post(
  '/',
  [
    runningAdmissionProgrammeCampusValidator.validateCreateRunningAdmissionProgrammeCampus,
  ],
  controller.createRunningAdmissionProgrammeCampus
);

runningAdmissionProgrammeCampusRouter.post(
  '/special-fees/',
  [
    runningAdmissionProgrammeCampusValidator.validateCreateRunningAdmissionProgrammeSpecialFees,
  ],
  controller.createRunningAdmissionProgrammeSpecialFees
);

runningAdmissionProgrammeCampusRouter.post(
  '/capacity-setting/',
  [
    runningAdmissionProgrammeCampusValidator.validateCreateSingleCapacitySetting,
  ],
  controller.createCapacitySetting
);

// runningAdmissionProgrammeCampusRouter.post(
//   '/special-remarks/',
//   [
//     runningAdmissionProgrammeCampusValidator.validateCreateRunningAdmissionProgrammeSpecialRemarks,
//   ],
//   controller.createRunningAdmissionProgrammeSpecialRemarks
// );

runningAdmissionProgrammeCampusRouter.get(
  '/fetch-by-running-admission-programme/:runningAdmissionProgrammeId',
  controller.index
);

runningAdmissionProgrammeCampusRouter.get(
  '/special-fees/:runningAdmissionProgrammeId',
  controller.fetchRunningAdmissionProgrammeSpecialFees
);

runningAdmissionProgrammeCampusRouter.get(
  '/:id',
  controller.fetchRunningAdmissionProgrammeCampus
);
runningAdmissionProgrammeCampusRouter.put(
  '/:runningAdmissionProgrammeCampusId',
  [
    runningAdmissionProgrammeCampusValidator.validateUpdateRunningAdmissionProgrammeCampus,
  ],
  controller.updateRunningAdmissionProgrammeCampus
);
runningAdmissionProgrammeCampusRouter.put(
  '/update-special-remarks/:runningAdmissionProgrammeId',
  [
    runningAdmissionProgrammeCampusValidator.validateUpdateRunningAdmissionProgrammeSpecialRemarks,
  ],
  controller.updateRunningAdmissionProgrammeSpecialRemarks
);
runningAdmissionProgrammeCampusRouter.put(
  '/update-special-fees/:runningAdmissionProgrammeSpecialFeeId',
  [
    runningAdmissionProgrammeCampusValidator.validateUpdateCapacitySettingSpecialFees,
  ],
  controller.updateRunningAdmissionProgrammeSpecialFees
);
runningAdmissionProgrammeCampusRouter.delete(
  '/:id',
  controller.hardDeleteRunningAdmissionProgrammeCampus
);
runningAdmissionProgrammeCampusRouter.delete(
  '/delete-special-fee/:specialFeeId',
  controller.deleteRunningAdmissionProgrammeSpecialFees
);

runningAdmissionProgrammeCampusRouter.put(
  '/soft-delete/:id',
  controller.softDeleteRunningAdmissionProgrammeCampus
);

runningAdmissionProgrammeCampusRouter.put(
  '/restore/:id',
  controller.undoSoftDeleteRunningAdmissionProgrammeCampus
);

module.exports = runningAdmissionProgrammeCampusRouter;
