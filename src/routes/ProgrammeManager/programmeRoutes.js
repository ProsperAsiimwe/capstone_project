const express = require('express');
const {
  ProgrammeController,
  AdmissionProgrammesController,
} = require('@controllers/ProgrammeManager');
const { programmeValidator } = require('@validators/ProgrammeManager');

const programmeRouter = express.Router();
const controller = new ProgrammeController();
const admissionProgController = new AdmissionProgrammesController();

// Program Management Routes.
programmeRouter.get('/', controller.programmeGroupByFunction);
programmeRouter.get('/colleges', controller.programmeGroupByFunction);
programmeRouter.get('/programmes-data', controller.programmeGroupByHandler);
programmeRouter.get('/search/:progCode', controller.searchProgrammesDetails);

// programme_study_yeas
programmeRouter.get(
  '/programme-study-years',
  controller.getProgrammeStudyYears
);

//
programmeRouter.get('/download', controller.getProgrammesDownload);
programmeRouter.get('/combinations', controller.getProgrammesWithCombinations);
programmeRouter.get('/departments', controller.getDepartmentProgrammes);
programmeRouter.get('/academic-units', controller.getAcademicUnitProgrammes);

//  admission programmes
programmeRouter.get(
  '/admissions',
  admissionProgController.admissionProgrammesFunction
);

programmeRouter.post('/upload', controller.uploadProgramme);
programmeRouter.post(
  '/download-template',
  controller.downloadProgrammeUploadTemplate
);

programmeRouter.post(
  '/',
  [programmeValidator.validateCreateProgramme],
  controller.createProgramme
);
programmeRouter.get('/:id', controller.fetchProgramme);
programmeRouter.put(
  '/:id',
  [programmeValidator.validateUpdateProgramme],
  controller.updateProgramme
);
programmeRouter.delete('/:id', controller.deleteProgramme);

// programme_study_year_campus
programmeRouter.get(
  '/programme-campus-study-years/:campus_id',
  controller.getProgrammeCampusStudyYears
);
// programmes by department
programmeRouter.get(
  '/programmes-data/:department_id',
  controller.programmeByDepartment
);

module.exports = programmeRouter;
