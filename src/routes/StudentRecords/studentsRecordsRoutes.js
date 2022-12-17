const express = require('express');
const {
  StudentsRecordsController,
  PreviousEnrollmentRecordsController,
} = require('@controllers/StudentRecords');

const studentRecordsRouter = express.Router();
const controller = new StudentsRecordsController();
const previousRecordsController = new PreviousEnrollmentRecordsController();

// students records

studentRecordsRouter.get('/', controller.findStudentFunction);

studentRecordsRouter.post(
  '/previous-enrollment-records-template',
  previousRecordsController.downloadTemplate
);

studentRecordsRouter.post(
  '/upload-previous-enrollment-records-template',
  previousRecordsController.uploadTemplate
);

module.exports = studentRecordsRouter;
