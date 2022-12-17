const express = require('express');
const { AcademicYearController } = require('@controllers/EventScheduler');
const { academicYearValidator } = require('@validators/EventScheduler');

const academicYearRouter = express.Router();
const controller = new AcademicYearController();

// Events Management Routes.
academicYearRouter.get('/', controller.index);
academicYearRouter.get('/by-campus', controller.academicYearsByCampus);
academicYearRouter.post(
  '/',
  [academicYearValidator.validateCreateAcademicYear],
  controller.createAcademicYear
);
academicYearRouter.get('/:id', controller.fetchAcademicYear);
academicYearRouter.put(
  '/:id',
  [academicYearValidator.validateUpdateAcademicYear],
  controller.updateAcademicYear
);
academicYearRouter.delete('/:id', controller.deleteAcademicYear);

module.exports = academicYearRouter;
