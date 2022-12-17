const express = require('express');
const { StudentController } = require('@controllers/StudentRecords');

const studentRecordsRouter = express.Router();
const controller = new StudentController();

studentRecordsRouter.get(
  '/fetch-student',
  controller.fetchStudentByRegNoOrStudentNo
);

studentRecordsRouter.post(
  '/academic-status/:studentProgrammeId/:studentId',
  controller.updateAcademicStatus
);

studentRecordsRouter.get(
  '/fetch-enrollment-and-registration/:studentProgrammeId',
  controller.fetchStudentRegistrationAndEnrollmentRecords
);

module.exports = studentRecordsRouter;
