const express = require('express');
const {
  RunningAdmissionApplicantController,
  ApplicantAttachmentController,
  ApplicantBioDataController,
  ApplicantProgrammeChoiceController,
  ApplicantALevelDataController,
  ApplicantOLevelDataController,
  DiplomaAdmissionKyuController,
  GraduateProgrammeController,
} = require('@controllers/Admissions');
const {
  // runningAdmissionApplicantValidator,
  applicantBioDataValidator,
  applicantProgrammeChoiceValidator,
  applicantALevelDataValidator,
  applicantOLevelDataValidator,
  runningAdmissionValidator,
} = require('@validators/Admissions');

const runningAdmissionApplicantRouter = express.Router();
const controller = new RunningAdmissionApplicantController();
const attachmentController = new ApplicantAttachmentController();
const bioDataController = new ApplicantBioDataController();
const programmeChoiceController = new ApplicantProgrammeChoiceController();
const applicantALevelDataController = new ApplicantALevelDataController();
const applicantOLevelDataController = new ApplicantOLevelDataController();
const diplomaReportController = new DiplomaAdmissionKyuController();
const gradProgController = new GraduateProgrammeController();

runningAdmissionApplicantRouter.get(
  '/running-admission-programme-applicant',
  controller.findRunningAdmissionProgrammeApplicantContext
);

runningAdmissionApplicantRouter.post(
  '/download-weighted-applicants',
  controller.downloadWeightedApplicants
);

runningAdmissionApplicantRouter.post(
  '/download-selected-applicants',
  controller.downloadSelectedApplicants
);

runningAdmissionApplicantRouter.post(
  '/download-not-selected-applicants',
  controller.downloadNotSelectedApplicants
);

runningAdmissionApplicantRouter.post(
  '/generate-not-selected-applicant-report',
  controller.generateDiscardedApplicantReport
);

runningAdmissionApplicantRouter.post(
  '/administratively-admit',
  [runningAdmissionValidator.administrativelyAdmitValidator],
  controller.administrativelyAdmitRunningAdmissionApplicant
);

// recommendGraduateApplicants
runningAdmissionApplicantRouter.post(
  '/recommend-applicants',
  controller.recommendGraduateApplicants
);

runningAdmissionApplicantRouter.post(
  '/generate-weights/:runningAdmissionProgrammeId',
  controller.generateApplicantsWeights
);

runningAdmissionApplicantRouter.post(
  '/generate-multiple-weights/:runningAdmissionId',
  controller.generateMultipleApplicantsWeights
);

runningAdmissionApplicantRouter.post(
  '/run-selections/:runningAdmissionId',
  controller.runApplicantSelections
);

runningAdmissionApplicantRouter.post(
  '/generate-prn/:formId',
  [applicantProgrammeChoiceValidator.validateGeneratePRNByStaff],
  controller.generatePRNByStaff
);

runningAdmissionApplicantRouter.get(
  '/summary',
  controller.runningAdmissionSummaryFunction
);

runningAdmissionApplicantRouter.get(
  '/all-applicants/:programme_campus_id',
  controller.fetchAllApplicantsByProgramme
);

runningAdmissionApplicantRouter.get(
  '/applicants/:programme_campus_id',
  controller.programmeCampusApplicants
);

runningAdmissionApplicantRouter.post(
  '/download-applicants/:programmeCampusId',
  controller.downloadCapacitySettingApplicants
);
// graduateProgrammeAdmissions
runningAdmissionApplicantRouter.post(
  '/download-graduate-prog/:programmeCampusId',
  controller.graduateProgrammeAdmissions
);

runningAdmissionApplicantRouter.post(
  '/download-graduate-pdf/:programmeCampusId',
  gradProgController.pdfGraduateAdmissions
);

// DiplomaAdmissionKyuController
runningAdmissionApplicantRouter.post(
  '/download-diploma-report/:programmeCampusId',
  diplomaReportController.diplomaAdmissionReportKyu
);

runningAdmissionApplicantRouter.get(
  '/applicant-form/:formId',
  controller.fetchApplicantFormByStaff
);

runningAdmissionApplicantRouter.get(
  '/fetch-applicant-attachments/:formId',
  attachmentController.fetchApplicantAttachmentByStaff
);

runningAdmissionApplicantRouter.post(
  '/download-applicant-attachment/:attachmentId',
  attachmentController.downloadApplicantAttachmentByStaff
);

runningAdmissionApplicantRouter.put(
  '/update-bio-data/:applicantId',
  [applicantBioDataValidator.validateUpdateApplicantBioDataByStaff],
  bioDataController.updateApplicantBioDataByStaff
);

runningAdmissionApplicantRouter.put(
  '/update-programme-choice/:programmeChoiceId',
  [applicantProgrammeChoiceValidator.validateUpdateApplicantProgrammeChoice],
  programmeChoiceController.updateApplicantProgrammeChoiceByStaff
);

runningAdmissionApplicantRouter.post(
  '/generate-uneb-report',
  [runningAdmissionValidator.validateDownloadReport],
  controller.generateUnebReport
);

runningAdmissionApplicantRouter.put(
  '/update-a-level-data/:aLevelDataId',
  [applicantALevelDataValidator.validateUpdateApplicantALevelDataByStaff],
  applicantALevelDataController.updateApplicantALevelDataByStaff
);

runningAdmissionApplicantRouter.put(
  '/update-o-level-data/:oLevelDataId',
  [applicantOLevelDataValidator.validateUpdateApplicantOLevelDataByStaff],
  applicantOLevelDataController.updateApplicantOLevelDataByStaff
);

runningAdmissionApplicantRouter.post(
  '/download-form/:formId',
  controller.downloadFilledFormByStaff
);

module.exports = runningAdmissionApplicantRouter;
