const AdmissionScheme = require('./admissionScheme.model');
const ProgrammeVersionWeightingCriteria = require('./programmeVersionWeightingCriteria.model');
const SelectionCriteriaStudyType = require('./selectionCriteriaStudyType.model');
const WeightingCriteriaCategory = require('./weightingCriteriaCategory.model');
const WeightingCriteriaCategorySubject = require('./weightingCriteriaCategorySubject.model');
const ProgrammeVersionSelectionCriteria = require('./programmeVersionSelectionCriteria.model');
const ProgrammeVersionPlanAdmissionCriteria = require('./programmeVersionPlanAdmissionCriteria.model');
const ProgrammeVersionPlanAdmissionCriteriaSubjects = require('./programmeVersionPlanAdmissionCriteriaSubjects.model');
const RunningAdmission = require('./runningAdmission.model');
const RunningAdmissionProgramme = require('./runningAdmissionProgramme.model');
const RunningAdmissionProgrammeCampus = require('./runningAdmissionProgrammeCampus.model');
const Applicant = require('./applicant.model');
const AdmissionForm = require('./admissionForm.model');
const AdmissionFormSection = require('./admissionFormSection.model');
const ApplicantBioData = require('./applicantBioData.model');
const ApplicantPermanentAddress = require('./applicantPermanentAddress.model');
const ApplicantNextOfKin = require('./applicantNextOfKin.model');
const ApplicantOLevelData = require('./applicantOLevelData.model');
const ApplicantOLevelDataSubject = require('./applicantOLevelDataSubject.model');
const ApplicantALevelData = require('./applicantALevelData.model');
const ALevelPrincipalSubject = require('./aLevelPrincipalSubject.model');
const ALevelSubsidiarySubject = require('./aLevelSubsidiarySubject.model');
const ApplicantRelevantQualification = require('./applicantRelevantQualification.model');
const ApplicantOtherQualification = require('./applicantOtherQualification.model');
const ApplicantDiplomaQualification = require('./applicantDiplomaQualification.model');
const ApplicantProgrammeChoice = require('./applicantProgrammeChoice.model');
const ApplicantAttachment = require('./applicantAttachment.model');
const ApplicantEmploymentRecord = require('./applicantEmploymentRecord.model');
const ApplicantRefereeDetail = require('./applicantRefereeDetail.model');
const ApplicantCertificateQualification = require('./applicantCertificateQualification.model');
const ApplicantBachelorsQualification = require('./applicantBachelorsQualification.model');
const ApplicantMastersQualification = require('./applicantMastersQualification.model');
const RunningAdmissionApplicant = require('./runningAdmissionApplicant.model');
const ApplicantPaymentTransaction = require('./applicantPaymentTransaction.model');
const RunningAdmissionProgrammeCampusEntryYear = require('./runningAdmissionProgrammeCampusEntryYear.model');
const RunningAdmissionProgrammeCampusSponsorship = require('./runningAdmissionProgrammeCampusSponsorship.model');
const RunningAdmissionProgrammeCampusCombination = require('./runningAdmissionProgrammeCampusCombination.model');
const RunningAdmissionProgrammeCampusSpecialFee = require('./runningAdmissionProgrammeSpecialFee.model');
const SpecialFeeAmount = require('./specialFeeAmount.model');
const MigratedApplicantEmploymentRecord = require('./migratedApplicantEmploymentRecord.model');
const MigratedApplicantOAndALevelData = require('./migratedApplicantOAndALevelData.model');
const MigratedApplicantOtherQualification = require('./migratedApplicantOtherQualification.model');
const MigratedApplicantRefereeDetail = require('./migratedApplicantRefereeDetail.model');
const ChangeOfProgramme = require('./changeOfProgramme.model');

module.exports = {
  AdmissionScheme,
  ProgrammeVersionWeightingCriteria,
  SelectionCriteriaStudyType,
  WeightingCriteriaCategory,
  WeightingCriteriaCategorySubject,
  ProgrammeVersionSelectionCriteria,
  ProgrammeVersionPlanAdmissionCriteria,
  ProgrammeVersionPlanAdmissionCriteriaSubjects,
  RunningAdmission,
  RunningAdmissionProgramme,
  RunningAdmissionProgrammeCampus,
  Applicant,
  AdmissionForm,
  AdmissionFormSection,
  ApplicantBioData,
  ApplicantPermanentAddress,
  ApplicantNextOfKin,
  ApplicantOLevelData,
  ApplicantOLevelDataSubject,
  ApplicantALevelData,
  ALevelPrincipalSubject,
  ALevelSubsidiarySubject,
  ApplicantRelevantQualification,
  ApplicantOtherQualification,
  ApplicantDiplomaQualification,
  ApplicantProgrammeChoice,
  ApplicantAttachment,
  ApplicantEmploymentRecord,
  ApplicantRefereeDetail,
  ApplicantCertificateQualification,
  ApplicantBachelorsQualification,
  ApplicantMastersQualification,
  RunningAdmissionApplicant,
  ApplicantPaymentTransaction,
  RunningAdmissionProgrammeCampusEntryYear,
  RunningAdmissionProgrammeCampusSponsorship,
  RunningAdmissionProgrammeCampusCombination,
  RunningAdmissionProgrammeCampusSpecialFee,
  SpecialFeeAmount,
  MigratedApplicantEmploymentRecord,
  MigratedApplicantOAndALevelData,
  MigratedApplicantOtherQualification,
  MigratedApplicantRefereeDetail,
  ChangeOfProgramme,
};
