const AdmissionSchemeController = require('./admissionScheme.controller');
const ApplicantController = require('./applicant.controller');
const ProgrammeVersionWeightingCriteriaController = require('./programmeVersionWeightingCriteria.controller');
const ProgrammeVersionSelectionCriteriaController = require('./programmeVersionSelectionCriteria.controller');
const ProgrammeVersionPlanAdmissionCriteriaController = require('./programmeVersionPlanAdmissionCriteria.controller');
const RunningAdmissionController = require('./runningAdmission.controller');
const RunningAdmissionProgrammeController = require('./runningAdmissionProgramme.controller');
const RunningAdmissionProgrammeCampusController = require('./runningAdmissionProgrammeCampus.controller');
const AdmissionFormController = require('./admissionForm.controller');
const ApplicantALevelDataController = require('./applicantALevelData.controller');
const ApplicantAttachmentController = require('./applicantAttachment.controller');
const ApplicantBioDataController = require('./applicantBioData.controller');
const applicantNextOfKinController = require('./applicantNextOfKin.controller');
const ApplicantOLevelDataController = require('./applicantOLevelData.controller');
const ApplicantRelevantQualificationController = require('./applicantRelevantQualification.controller');
const ApplicantOtherQualificationController = require('./applicantOtherQualification.controller');
const ApplicantDiplomaQualificationController = require('./applicantDiplomaQualification.controller');
const applicantPermanentAddressController = require('./applicantPermanentAddress.controller');
const ApplicantProgrammeChoiceController = require('./applicantProgrammeChoice.controller');
const applicantEmploymentRecordController = require('./applicantEmploymentRecord.controller');
const applicantRefereeDetailController = require('./applicantRefereeDetail.controller');
const RunningAdmissionApplicantController = require('./runningAdmissionApplicant.controller');
const AdmissionSchemeReportsController = require('./admissionSchemeReports.controller');
const ApplicantBachelorsQualificationController = require('./applicantBachelorsQualification.controller');
const ApplicantCertificateQualificationController = require('./applicantCertificateQualification.controller');
const ApplicantMastersQualificationController = require('./applicantMastersQualification.controller');
const SearchApplicantController = require('./searchApplicants.controller');
const MigratedApplicantController = require('./migratedApplicant.controller');
const AdmittedApplicantsViewsController = require('./admittedApplicantsViews.controller');
const ReportsAdmittedAnalyticsController = require('./reportsAdmittedAnalytics.controller');
const ChangeOfProgrammeController = require('./changeOfProgramme.controller');
const ChangeProgrammeReportsController = require('./changeProgrammeReport.controller');
const AdmissionStatisticsController = require('./admissionStatistics.controller');
const DiplomaAdmissionKyuController = require('./diplomaAdmissionKyu.controller');
const GraduateProgrammeController = require('./generatePdfgraduate.controller');

module.exports = {
  AdmissionSchemeController,
  ApplicantController,
  ProgrammeVersionWeightingCriteriaController,
  ProgrammeVersionSelectionCriteriaController,
  ProgrammeVersionPlanAdmissionCriteriaController,
  RunningAdmissionController,
  RunningAdmissionProgrammeController,
  RunningAdmissionProgrammeCampusController,
  AdmissionFormController,
  ApplicantALevelDataController,
  ApplicantAttachmentController,
  ApplicantBioDataController,
  applicantNextOfKinController,
  ApplicantOLevelDataController,
  ApplicantRelevantQualificationController,
  ApplicantOtherQualificationController,
  ApplicantDiplomaQualificationController,
  applicantPermanentAddressController,
  ApplicantProgrammeChoiceController,
  applicantEmploymentRecordController,
  applicantRefereeDetailController,
  RunningAdmissionApplicantController,
  AdmissionSchemeReportsController,
  ApplicantBachelorsQualificationController,
  ApplicantCertificateQualificationController,
  ApplicantMastersQualificationController,
  SearchApplicantController,
  MigratedApplicantController,
  AdmittedApplicantsViewsController,
  ReportsAdmittedAnalyticsController,
  ChangeOfProgrammeController,
  ChangeProgrammeReportsController,
  AdmissionStatisticsController,
  DiplomaAdmissionKyuController,
  GraduateProgrammeController,
};
