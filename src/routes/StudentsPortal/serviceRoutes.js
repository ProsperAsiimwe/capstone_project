const { ServiceController } = require('@controllers/index');
const { studentServiceValidator } = require('@validators/StudentRecords');
const express = require('express');

const serviceRoute = express.Router();
const studentServiceController = new ServiceController();

serviceRoute.get('/programmes', studentServiceController.getProgrammes);
serviceRoute.get(
  '/pending/change-of-programme',
  studentServiceController.getPendingChangeOfProgramme
);
serviceRoute.get(
  '/all/change-of-programme',
  studentServiceController.getAllPendingChangeOfProgrammes
);
serviceRoute.get(
  '/history/change-of-programme',
  studentServiceController.getChangeOfProgrammeHistory
);
serviceRoute.get(
  '/event/:studentProgrammeId',
  studentServiceController.getChangeOfProgrammeEvent
);

serviceRoute.post(
  '/change-of-programme',
  [studentServiceValidator.validateCreateStudentService],
  studentServiceController.applyForChangeOfProgramme
);
serviceRoute.put(
  '/change-of-programme/:id',
  [studentServiceValidator.validateCreateStudentService],
  studentServiceController.updateStudentChangeOfProgramme
);
serviceRoute.delete(
  '/change-of-programme/:id',
  studentServiceController.deleteStudentChangeOfProgramme
);

serviceRoute.post(
  '/generate-prn/change-of-programme/:changeOfProgrammeId',
  studentServiceController.generateStudentServicePRN
);
serviceRoute.post(
  '/download-letter/change-of-programme/:changeOfProgrammeId',
  studentServiceController.generateAcceptanceLetter
);

module.exports = serviceRoute;
