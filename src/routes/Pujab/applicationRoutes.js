const express = require('express');
const {
  PujabRunningAdmissionController,
  PujabApplicantController,
} = require('@controllers/Pujab');
const { pujabAdmissionValidator } = require('@validators/Pujab');

const applicationRouter = express.Router();
const controller = new PujabRunningAdmissionController();
const applicantController = new PujabApplicantController();

// Routes.
applicationRouter.post(
  '/',
  [pujabAdmissionValidator.validateCreatePujabAdmission],
  controller.createAdmission
);
applicationRouter.post(
  '/add-institution-programmes/',
  [pujabAdmissionValidator.validateCreateAdmissionInstitutionProgramme],
  controller.createAdmissionInstitutionProgramme
);
applicationRouter.get('/', controller.getAllAdmissions);

applicationRouter.get('/:id', controller.findOneAdmission);

applicationRouter.put('/activate/:id', controller.activateAdmission);

applicationRouter.put('/de-activate/:id', controller.deActivateAdmission);

applicationRouter.get(
  '/pujab-admission-institution/:id',
  controller.findOnePujabAdmissionInstitution
);

applicationRouter.put(
  '/:id',
  [pujabAdmissionValidator.validateCreatePujabAdmission],
  controller.updateAdmission
);

applicationRouter.delete(
  '/pujab-admission-institution-programmes',
  [pujabAdmissionValidator.validateDeletePujabAdmissionInstitutionProgrammes],
  controller.deletePujabAdmissionInstitutionProgrammes
);

applicationRouter.delete('/:id', controller.deleteAdmission);

applicationRouter.delete(
  '/pujab-admission-institution/:id',
  controller.deletePujabAdmissionInstitution
);

// REPORTS
applicationRouter.get(
  '/applicants/report/:academicYear',
  applicantController.academicYearReport
);
applicationRouter.post(
  '/applicants/download-report/:academicYear',
  applicantController.downloadAcademicYearReport
);
applicationRouter.get(
  '/applicants/report-details/:academicYear',
  applicantController.academicYearReportDetails
);

applicationRouter.get(
  '/applicants/programme-choices/:applicationId',
  applicantController.applicationProgrammeChoices
);

module.exports = applicationRouter;
