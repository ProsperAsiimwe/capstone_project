const express = require('express');
const { StudentsRecordsController } = require('@controllers/StudentRecords');

const studentProgrammeRouter = express.Router();
const controller = new StudentsRecordsController();

// students records

studentProgrammeRouter.get(
  '/dissertations',
  controller.getStudentDissertations
);
studentProgrammeRouter.get('/:id', controller.programmeDetails);

module.exports = studentProgrammeRouter;
