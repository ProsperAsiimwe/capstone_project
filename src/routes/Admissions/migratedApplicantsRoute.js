const express = require('express');
const { MigratedApplicantController } = require('@controllers/Admissions');
const { applicantProgrammeChoiceValidator } = require('@validators/Admissions');

const migratedApplicantRouter = express.Router();
const controller = new MigratedApplicantController();

// MigratedApplicants Routes.

migratedApplicantRouter.post(
  '/download-migrate-applicants-template',
  controller.downloadMigrateApplicantsTemplate
);

migratedApplicantRouter.post(
  '/upload-migrate-applicants-template',
  controller.uploadMigrateApplicantsTemplate
);

migratedApplicantRouter.post(
  '/download-admit-applicants-template',
  controller.downloadAdministrativelyAdmittedApplicantsTemplate
);

migratedApplicantRouter.post(
  '/upload-admit-applicants-template',
  controller.uploadAdministrativelyAdmittedApplicantsTemplate
);

migratedApplicantRouter.post(
  '/generate-registration-numbers',
  controller.generateRegistrationNumbers
);

migratedApplicantRouter.post(
  '/generate-student-numbers',
  controller.generateStudentNumbers
);

migratedApplicantRouter.post(
  '/fix-duplicate-applicant-reg-numbers',
  controller.fixDuplicateRegistrationNumbers
);

migratedApplicantRouter.post('/generate-halls', controller.generateHalls);

migratedApplicantRouter.put(
  '/:applicantId',
  [applicantProgrammeChoiceValidator.validateUpdateAdmittedApplicant],
  controller.updateAdmittedApplicant
);

module.exports = migratedApplicantRouter;
