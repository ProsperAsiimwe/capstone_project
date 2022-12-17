const facultyService = require('./ProgrammeManager/faculty.service');
const collegeService = require('./ProgrammeManager/college.service');
const departmentService = require('./ProgrammeManager/department.service');
const programmeService = require('./ProgrammeManager/programme.service');
const courseUnitService = require('./ProgrammeManager/courseUnit.service');
const subjectService = require('./ProgrammeManager/subject.service');
const unebSubjectService = require('./ProgrammeManager/unebSubject.service');
const specializationService = require('./ProgrammeManager/specialization.service');
const subjectCombinationService = require('./ProgrammeManager/subjectCombination.service');
const programmeVersionService = require('./ProgrammeManager/programmeVersion.service');
const metadataService = require('./App/metadata.service');
const metadataValueService = require('./App/metadataValue.service');
const applicationService = require('./UserAccess/applications.service');
const appFunctionService = require('./UserAccess/appfunction.service');
const gradingService = require('./ProgrammeManager/grading.service');
const gradingValueService = require('./ProgrammeManager/gradingValue.service');
const programmeVersionPlanService = require('./ProgrammeManager/programmeVersionPlan.service');
const progVersAdmCriteriaService = require('./ProgrammeManager/progVersAdmCriteria.service');
const progVersPlanAdmCriteriaService = require('./ProgrammeManager/progVersPlanAdmCriteria.service');
const semesterLoadService = require('./ProgrammeManager/semesterLoad.service');
const programmeAliasService = require('./ProgrammeManager/programmeAlias.service');
const programmeVersionCourseUnitService = require('./ProgrammeManager/programmeVersionCourseUnit.service');
const fixProgrammeYearsService = require('./ProgrammeManager/fixProgrammeYears.service');
const studentProgrammeService = require('./ProgrammeManager/studentProgramme.service');

// student mgt
const studentService = require('./StudentRecords/student.service');
const studentApprovalService = require('./StudentRecords/studentApproval.service');
const studentsRecordsService = require('./StudentRecords/studentsRecords.service');
const studentsReportsService = require('./StudentRecords/studentsReports.service');
const studentMgtActivityLogService = require('./StudentRecords/studentMgtActivityLog.service');
const academicDocumentService = require('./StudentRecords/academicDocument.service');
const studentProgrammeDissertationService = require('./StudentRecords/studentProgrammeDissertation.service');

// App services
const OTPCodeService = require('./App/OTPCode.service');
const institutionStructureService = require('./App/institutionStructure.service');
const documentSettingService = require('./App/documentSetting.service');
const logService = require('./App/log.service');
const twoFactorAuthService = require('./App/twoFactorAuth.service');

// user-mgt services
const userService = require('./UserAccess/user.service');
const securityProfileService = require('./UserAccess/securityProfile.service');
const userRoleService = require('./UserAccess/role.service');
const userRoleGroupService = require('./UserAccess/userRoleGroup.service');
const roleProfileService = require('./UserAccess/roleProfile.service');
const roleService = require('./UserAccess/role.service');

// events-mgt services
const academicYearService = require('./EventScheduler/academicYear.service');
const semesterService = require('./EventScheduler/semester.service');
const eventService = require('./EventScheduler/event.service');

// Admissions services
const admissionSchemeService = require('./Admissions/admissionScheme.service');
const applicantService = require('./Admissions/applicant.service');
const programmeVersionWeightingCriteriaService = require('./Admissions/programmeVersionWeightingCriteria.service');
const programmeVersionSelectionCriteriaService = require('./Admissions/programmeVersionSelectionCriteria.service');
const programmeVersionPlanAdmissionCriteriaService = require('./Admissions/programmeVersionPlanAdmissionCriteria.service');
const runningAdmissionService = require('./Admissions/runningAdmission.service');
const runningAdmissionProgrammeService = require('./Admissions/RunningAdmissionProgramme.service');
const runningAdmissionProgrammeCampusService = require('./Admissions/runningAdmissionProgrammeCampus.service');
const admissionFormService = require('./Admissions/admissionForm.service');
const applicantALevelDataService = require('./Admissions/applicantALevelData.service');
const applicantAttachmentService = require('./Admissions/applicantAttachment.service');
const applicantBioDataService = require('./Admissions/applicantBioData.service');
const applicantNextOfKinService = require('./Admissions/applicantNextOfKin.service');
const applicantOLevelDataService = require('./Admissions/applicantOLevelData.service');
const applicantRelevantQualificationService = require('./Admissions/applicantRelevantQualification.service');
const applicantOtherQualificationService = require('./Admissions/applicantOtherQualification.service');
const applicantDiplomaQualificationService = require('./Admissions/applicantDiplomaQualification.service');
const applicantPermanentAddressService = require('./Admissions/applicantPermanentAddress.service');
const applicantProgrammeChoiceService = require('./Admissions/applicantProgrammeChoice.service');
const applicantEmploymentRecordService = require('./Admissions/applicantEmploymentRecord.service');
const applicantRefereeDetailService = require('./Admissions/applicantRefereeDetail.service');
const runningAdmissionApplicantService = require('./Admissions/runningAdmissionApplicant.service');
const applicantCertificateQualificationService = require('./Admissions/applicantCertificateQualification.service');
const applicantBachelorsQualificationService = require('./Admissions/applicantBachelorsQualification.service');
const applicantMastersQualificationService = require('./Admissions/applicantMastersQualification.service');
const admittedApplicantService = require('./Admissions/admittedApplicant.service');
const deletedAdmittedApplicantService = require('./Admissions/deletedAdmittedApplicant.service');
const admissionStatisticsService = require('./Admissions/admissionStatistics.service');

// admission views
const runningAdmissionViewsService = require('./Admissions/runningAdmissionViews.service');
const admissionSchemeReportsService = require('./Admissions/AdmissionSchemeReports.service');
const searchApplicantsService = require('./Admissions/searchApplicants.service');
const admittedApplicantsViewsService = require('./Admissions/admittedApplicantsViews.service');

// FeesManager services
const feesElementService = require('./FeesManager/feesElement.service');
const feesWaiverService = require('./FeesManager/feesWaiver.service');
const feesWaiverDiscountService = require('./FeesManager/feesWaiverDiscount.service');
const tuitionAmountService = require('./FeesManager/tuitionAmount.service');
const functionalFeesAmountService = require('./FeesManager/functionalFeesAmount.service');
const otherFeesAmountService = require('./FeesManager/otherFeesAmount.service');
const feesAmountPreviewService = require('./FeesManager/feesAmountPreview.service');
const feesCopyService = require('./FeesManager/feesCopy.service');
const feesApprovalService = require('./FeesManager/feesApproval.service');
const exemptedTuitionCampusService = require('./FeesManager/exemptedTuitionCampus.service');
const graduationFeesService = require('./FeesManager/graduationFees.service');

// enrollment and registration mgt
const enrollmentService = require('./EnrollmentAndRegistration/enrollment.service');
const invoiceService = require('./EnrollmentAndRegistration/invoice.service');
const paymentReferenceService = require('./EnrollmentAndRegistration/paymentReference.service');
const registrationService = require('./EnrollmentAndRegistration/registration.service');
const paymentTransactionService = require('./EnrollmentAndRegistration/paymentTransaction.service');
const creditNoteService = require('./EnrollmentAndRegistration/creditNote.service');
const debitNoteService = require('./EnrollmentAndRegistration/debitNote.service');
const migratedEnrollmentRecordsService = require('./EnrollmentAndRegistration/migratedEnrollmentRecords.service');
const fundsTransferService = require('./EnrollmentAndRegistration/fundsTransfer.service');
const studentInvoiceSummaryService = require('./EnrollmentAndRegistration/studentInvoiceSummary.service');

const summaryReportsService = require('./EnrollmentAndRegistration/summaryReports.service');
const summaryReportsByFacultyService = require('./EnrollmentAndRegistration/summaryReportsByFaculty.service');
const summaryReportsByDepartmentService = require('./EnrollmentAndRegistration/summaryReportsByDepartment.service');
const detailedReportsService = require('./EnrollmentAndRegistration/detailedReports.service');
const detailedReportsByDepartmentsService = require('./EnrollmentAndRegistration/detailedReportsByDepartments.services');
const detailedReportsByFacultiesService = require('./EnrollmentAndRegistration/detailedReportsByFaculties.services');
const detailedReportStudentsService = require('./EnrollmentAndRegistration/detailedReportStudents.service');
const paymentReportsService = require('./EnrollmentAndRegistration/paymentReports.service');
const paymentReportsByFacultyService = require('./EnrollmentAndRegistration/paymentReportsByFaculty.service');
const paymentReportsByDepartmentService = require('./EnrollmentAndRegistration/paymentReportsByDepartments.service');
const paymentReportsStudentsService = require('./EnrollmentAndRegistration/paymentReportsStudents.service');
const summaryEnrollmentStatusService = require('./EnrollmentAndRegistration/summaryEnrollment.services');
const summaryAcademicUnitService = require('./EnrollmentAndRegistration/summaryAcademicUnitReport.service');
const summaryPaymentReportService = require('./EnrollmentAndRegistration/summaryPaymentReport.service');
const registrationStatisticsService = require('./EnrollmentAndRegistration/registrationStatistics.service');

// institution-mgt
const registrationPolicyService = require('./InstitutionPolicy/registrationPolicy.service');
const otherFeesPolicyService = require('./InstitutionPolicy/otherFeesPolicy.service');
const retakersFeesPolicyService = require('./InstitutionPolicy/retakersFeesPolicy.service');
const surchargePolicyService = require('./InstitutionPolicy/surchargePolicy.service');
const resultsPolicyService = require('./InstitutionPolicy/resultsPolicy.service');
const academicYearFeesPolicyService = require('./InstitutionPolicy/academicYearFeesPolicy.service');
const applicationFeesPolicyService = require('./InstitutionPolicy/applicationFeesPolicy.service');
const admissionFeesPolicyService = require('./InstitutionPolicy/admissionFeesPolicy.service');
const resultCategoryPolicyService = require('./InstitutionPolicy/resultCategoryPolicy.service');
const concededPassPolicyService = require('./InstitutionPolicy/concededPassPolicy.service');
const documentVerificationPolicyService = require('./InstitutionPolicy/documentVerificationPolicy.service');
const enrollmentAndRegistrationHistoryPolicyService = require('./InstitutionPolicy/enrollmentAndRegistrationHistoryPolicy.service');
const hallAllocationPolicyService = require('./InstitutionPolicy/hallAllocationPolicy.service');
const studentServicePolicyService = require('./InstitutionPolicy/studentServicePolicy.service');
const graduateFeesPolicyService = require('./InstitutionPolicy/graduateFeesPolicy.service');

// course-assignment
const assignmentService = require('./courseAssignment/assignment.service');
const courseAssignmentService = require('./courseAssignment/courseAssignment.service');
const buildingService = require('./courseAssignment/building.service');
const timetableService = require('./courseAssignment/timetable.service');
const semesterCourseLoadService = require('./courseAssignment/semesterCourseLoad.service');

// Universal Payments
const chartOfAccountService = require('./UniversalPayments/chartOfAccount.service');
const receivableService = require('./UniversalPayments/receivable.service');
const universalInvoiceService = require('./UniversalPayments/universalInvoice.service');
const uniPaymentReportService = require('./UniversalPayments/reports.service');
const bulkPaymentService = require('./UniversalPayments/bulkPayment.service');
const systemPRNTrackerService = require('./UniversalPayments/systemPRNTracker.service');
const reportsUniPayService = require('./UniversalPayments/reportsUniPay.service');
const sponsorService = require('./UniversalPayments/sponsor.service');
const sponsorStudentService = require('./UniversalPayments/sponsorStudent.service');
const previousTransactionsService = require('./UniversalPayments/previousTransactions.service');
const studentPaymentService = require('./UniversalPayments/studentPayment.service');
const searchTransactionsService = require('./UniversalPayments/searchTransactions.service');
const reportsChartOfAccountService = require('./UniversalPayments/reportsChartOfAcounts.service');
const reportsAccountService = require('./UniversalPayments/reportsAccount.service');

// Results management
const resultAllocationNodeService = require('./Result/resultAllocationNode.service');
const nodeQuestionService = require('./Result/nodeQuestion.service');
const resultService = require('./Result/result.service');
const graduationListService = require('./Result/graduationList.service');
const reportsService = require('./Result/reports.service');
const resultBatchesService = require('./Result/resultBatches.service');
const senateReportService = require('./Result/senateReport.service');
const graduatedStudentsService = require('./Result/graduatedStudents.service');

// programme reports
const programmesReportsService = require('./ProgrammeManager/programmesReports.service');
const changeOfProgrammeService = require('./Admissions/changeOfProgramme.service');

// NTC MGT
const NTCStudentService = require('./NTCMgt/NTCStudent.service');
const NTCResultService = require('./NTCMgt/NTCResult.service');
const NTCSubjectService = require('./NTCMgt/NTCSubject.service');
const NTCAcademicDocumentService = require('./NTCMgt/NTCAcademicDocument.service');

// BI REPORTING

const resultBiReportService = require('./Bi-Reports/results.service');
const BiReportService = require('./UniversalPayments/biReport.service');
const admissionBiReportService = require('./Bi-Reports/admissions.service');
const transactionsReportService = require('./Bi-Reports/transactions.service');
const financialYearReportService = require('./Bi-Reports/financialYear.service');
const enrollmentReportService = require('./Bi-Reports/enrollment.service');
// API
const clientService = require('./api/client.service');
const emisService = require('./api/emis.service');
const emisIntegrationService = require('./api/emisIntegration.service');
// lecturer module

const lecturerCoursesService = require('./courseAssignment/lecturerApp.service');

// PUJAB
const pujabApplicantService = require('./Pujab/pujabApplicant.service');
const pujabInstitutionProgrammeService = require('./Pujab/pujabProgramme.service');
const pujabApplicationService = require('./Pujab/pujabApplication.service');
const pujabInstitutionService = require('./Pujab/pujabInstitution.service');
const pujabRunningAdmissionService = require('./Pujab/pujabRunningAdmission.service');
const pujabApplicantPaymentService = require('./Pujab/pujabApplicantPayment.service');
const pujabApplicantUnebSelectionService = require('./Pujab/pujabApplicantUnebSelection.service');

// E-VOTING-MGT
const electivePositionService = require('./Evoting/electivePosition.service');

module.exports = {
  userService,
  facultyService,
  collegeService,
  departmentService,
  courseUnitService,
  subjectService,
  subjectCombinationService,
  specializationService,
  programmeService,
  unebSubjectService,
  programmeVersionService,
  metadataValueService,
  metadataService,
  OTPCodeService,
  gradingService,
  programmeVersionPlanService,
  gradingValueService,
  progVersAdmCriteriaService,
  progVersPlanAdmCriteriaService,
  semesterLoadService,
  applicationService,
  securityProfileService,
  userRoleService,
  userRoleGroupService,
  appFunctionService,
  programmeAliasService,
  roleProfileService,
  academicYearService,
  semesterService,
  eventService,
  feesElementService,
  feesWaiverService,
  feesWaiverDiscountService,
  tuitionAmountService,
  functionalFeesAmountService,
  otherFeesAmountService,
  admissionSchemeService,
  applicantService,
  programmeVersionWeightingCriteriaService,
  programmeVersionSelectionCriteriaService,
  programmeVersionPlanAdmissionCriteriaService,
  runningAdmissionService,
  runningAdmissionProgrammeService,
  runningAdmissionProgrammeCampusService,
  admissionFormService,
  feesAmountPreviewService,
  applicantALevelDataService,
  applicantAttachmentService,
  applicantBioDataService,
  applicantNextOfKinService,
  applicantOLevelDataService,
  applicantRelevantQualificationService,
  applicantOtherQualificationService,
  applicantDiplomaQualificationService,
  applicantPermanentAddressService,
  applicantProgrammeChoiceService,
  applicantEmploymentRecordService,
  applicantRefereeDetailService,
  runningAdmissionApplicantService,
  studentService,
  studentApprovalService,
  enrollmentService,
  invoiceService,
  paymentReferenceService,
  registrationPolicyService,
  registrationService,
  paymentTransactionService,
  otherFeesPolicyService,
  retakersFeesPolicyService,
  surchargePolicyService,
  detailedReportStudentsService,
  paymentReportsService,
  creditNoteService,
  debitNoteService,
  paymentReportsStudentsService,
  institutionStructureService,
  documentSettingService,
  feesCopyService,
  feesApprovalService,
  assignmentService,
  courseAssignmentService,
  semesterCourseLoadService,
  buildingService,
  timetableService,
  studentsRecordsService,
  programmesReportsService,
  studentsReportsService,
  academicDocumentService,
  studentProgrammeDissertationService,
  programmeVersionCourseUnitService,
  summaryReportsService,
  summaryReportsByFacultyService,
  summaryReportsByDepartmentService,
  detailedReportsService,
  detailedReportsByDepartmentsService,
  detailedReportsByFacultiesService,
  paymentReportsByFacultyService,
  paymentReportsByDepartmentService,
  chartOfAccountService,
  receivableService,
  universalInvoiceService,
  resultsPolicyService,
  resultAllocationNodeService,
  resultService,
  academicYearFeesPolicyService,
  uniPaymentReportService,
  bulkPaymentService,
  applicationFeesPolicyService,
  admissionFeesPolicyService,
  systemPRNTrackerService,
  graduationListService,
  runningAdmissionViewsService,
  nodeQuestionService,
  resultCategoryPolicyService,
  reportsService,
  reportsUniPayService,
  reportsChartOfAccountService,
  reportsAccountService,
  fixProgrammeYearsService,
  sponsorService,
  sponsorStudentService,
  resultBatchesService,
  concededPassPolicyService,
  senateReportService,
  previousTransactionsService,
  studentPaymentService,
  searchTransactionsService,
  admissionSchemeReportsService,
  searchApplicantsService,
  applicantCertificateQualificationService,
  applicantBachelorsQualificationService,
  applicantMastersQualificationService,
  graduatedStudentsService,
  logService,
  documentVerificationPolicyService,
  migratedEnrollmentRecordsService,
  enrollmentAndRegistrationHistoryPolicyService,
  admittedApplicantService,
  deletedAdmittedApplicantService,
  hallAllocationPolicyService,
  roleService,
  admittedApplicantsViewsService,
  summaryEnrollmentStatusService,
  summaryAcademicUnitService,
  summaryPaymentReportService,
  registrationStatisticsService,
  studentServicePolicyService,
  changeOfProgrammeService,
  studentProgrammeService,
  studentMgtActivityLogService,
  admissionStatisticsService,
  NTCStudentService,
  NTCResultService,
  NTCSubjectService,
  NTCAcademicDocumentService,
  exemptedTuitionCampusService,
  fundsTransferService,
  studentInvoiceSummaryService,
  graduateFeesPolicyService,
  resultBiReportService,
  graduationFeesService,
  BiReportService,
  transactionsReportService,
  financialYearReportService,
  admissionBiReportService,
  lecturerCoursesService,
  clientService,
  emisService,
  emisIntegrationService,
  pujabApplicantService,
  pujabInstitutionProgrammeService,
  pujabApplicationService,
  pujabInstitutionService,
  pujabRunningAdmissionService,
  pujabApplicantPaymentService,
  enrollmentReportService,
  twoFactorAuthService,
  pujabApplicantUnebSelectionService,
  electivePositionService,
};
