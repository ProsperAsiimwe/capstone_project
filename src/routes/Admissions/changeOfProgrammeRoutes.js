const express = require('express');
const {
  ChangeOfProgrammeController,
  ChangeProgrammeReportsController,
} = require('@controllers/Admissions');
const { studentServiceValidator } = require('@validators/StudentRecords');

const changeOfProgrammeRouter = express.Router();
const controller = new ChangeOfProgrammeController();
const report = new ChangeProgrammeReportsController();

changeOfProgrammeRouter.get('/', controller.index);
changeOfProgrammeRouter.get('/programmes', controller.getProgrammes);
changeOfProgrammeRouter.get('/pending', controller.getAllPending);
//  download
changeOfProgrammeRouter.get('/event/:studentId', controller.getEvent);
changeOfProgrammeRouter.post(
  '/download-report',
  report.downloadChangeProgramme
);

changeOfProgrammeRouter.post(
  '/generate-prn/:changeOfProgrammeId',
  controller.generatePRN
);
changeOfProgrammeRouter.delete(
  '/:serviceId/:studentId',
  controller.deleteStudentChangeOfProgrammeByStaff
);
changeOfProgrammeRouter.post(
  '/create/:studentId',
  [studentServiceValidator.validateCreateStudentService],
  controller.create
);
changeOfProgrammeRouter.post(
  '/accept-or-decline',
  [studentServiceValidator.validateAcceptOrDeclineStudentService],
  controller.acceptOrDecline
);
changeOfProgrammeRouter.put(
  '/edit-academic-year',
  [studentServiceValidator.validateEditAcademicYearService],
  controller.editAcademicYear
);
changeOfProgrammeRouter.post(
  '/approve',
  [studentServiceValidator.validateApproveStudentService],
  controller.approve
);
changeOfProgrammeRouter.put('/bulk-acceptance', controller.bulkAcceptance);
changeOfProgrammeRouter.put('/bulk-update', controller.updateApproveBy);
changeOfProgrammeRouter.put(
  '/bulk-programme-version',
  controller.updateApprovedProgrammeVersions
);
changeOfProgrammeRouter.put(
  '/bulk-update-active-programme',
  controller.updateActivateApprovedProgrammes
);

module.exports = changeOfProgrammeRouter;
