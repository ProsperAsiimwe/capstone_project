const express = require('express');
const { StudentsReportsController } = require('@controllers/StudentRecords');

const studentReportsRouter = express.Router();
const controller = new StudentsReportsController();

// students records

studentReportsRouter.get('/', controller.studentReportsFunction);

//  academicYearStudent
studentReportsRouter.get(
  '/academic-year',
  controller.studentAcademicYearReportsFunction
);

module.exports = studentReportsRouter;
