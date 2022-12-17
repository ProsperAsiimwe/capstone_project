const express = require('express');
const {
  AdmittedApplicantsViewsController,
} = require('@controllers/Admissions');
const { documentValidator } = require('@validators/AcademicDocuments');

const admittedApplicantsViewsRouter = express.Router();
const controller = new AdmittedApplicantsViewsController();

// admitted applicants

admittedApplicantsViewsRouter.get('/applicants', controller.admittedApplicants);
// admissionProgrammes
admittedApplicantsViewsRouter.get(
  '/programmes',
  controller.admissionProgrammes
);
admittedApplicantsViewsRouter.get(
  '/weighted-applicants',
  controller.applicantWeightingFunction
);

admittedApplicantsViewsRouter.get(
  '/selected-applicants',
  controller.selectedApplicants
);

admittedApplicantsViewsRouter.get(
  '/not-selected-applicants',
  controller.notSelectedApplicants
);

admittedApplicantsViewsRouter.post(
  '/generate-admission-letters',
  [documentValidator.validateGenerateAdmissionScheme],
  controller.printAdmissionLetters
);
admittedApplicantsViewsRouter.post(
  '/print-admission-letters',
  [documentValidator.validateGenerateAdmissionScheme],
  controller.downloadAdmissionLetters
);

// singleAdmittedApplicant
admittedApplicantsViewsRouter.get(
  '/applicants/:admittedApplicantId',
  controller.singleAdmittedApplicant
);
admittedApplicantsViewsRouter.delete(
  '/applicants/delete-students',
  controller.deleteAdmittedApplicants
);
admittedApplicantsViewsRouter.delete(
  '/applicants/delete-srm-students',
  controller.deleteAdmittedApplicantStudentRecords
);
admittedApplicantsViewsRouter.put(
  '/applicants/update-subject-combs',
  controller.updateSubjectCombinations
);
admittedApplicantsViewsRouter.put(
  '/applicants/update-student-numbers',
  controller.updateStudentNumbers
);
admittedApplicantsViewsRouter.put(
  '/applicants/update-student-names',
  controller.updateStudentNames
);
admittedApplicantsViewsRouter.put(
  '/applicants/update-student-names-in-srm',
  controller.updateStudentNamesFormSRM
);

module.exports = admittedApplicantsViewsRouter;
