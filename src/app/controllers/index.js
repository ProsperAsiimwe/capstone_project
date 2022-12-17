const appController = require('./app.controller');
const ProgrammeController = require('./ProgrammeManager/programme.controller');
const UserController = require('./UserAccess/user.controller');
const CollegeController = require('./ProgrammeManager/college.controller');
const facultyController = require('./ProgrammeManager/faculty.controller');
const departmentController = require('./ProgrammeManager/department.controller');
const SpecializationController = require('./ProgrammeManager/specialization.controller');
const SubjectCombinationController = require('./ProgrammeManager/subjectCombination.controller');
const CourseUnitController = require('./ProgrammeManager/courseUnit.controller');
const SubjectController = require('./ProgrammeManager/subject.controller');
const UnebSubjectController = require('./ProgrammeManager/unebSubject.controller');
const ProgrammeVersionController = require('./ProgrammeManager/programmeVersion.controller');
const MetadataController = require('./App/metadata.controller');
const MetadataValueController = require('./App/metadataValue.controller');
const ApplicationController = require('./UserAccess/application.controller');
const AppFunctionController = require('./UserAccess/appFunction.controller');
const ProgVersAdmCriteriaController = require('./ProgrammeManager/progVersAdmCriteria.controller');
const SemesterLoadController = require('./ProgrammeManager/semesterLoad.controller');
const SecurityProfileController = require('./UserAccess/securityProfile.controller');
const ProgrammeVersionPlanController = require('./ProgrammeManager/programmeVersionPlan.controller');
const GradingController = require('./ProgrammeManager/grading.controller');
const GradingValueController = require('./ProgrammeManager/gradingValue.controller');
const StudentController = require('./StudentRecords/student.controller');
const InstitutionStructureController = require('./App/institutionStructure.controller');
const DocumentSettingController = require('./App/documentSetting.controller');
const ProgrammesReportsController = require('./ProgrammeManager/programmesReports.controller');
const StudentsReportsController = require('./StudentRecords/studentsReports.controller');
const ProgrammeVersionCourseUnitController = require('./ProgrammeManager/programmeVersionCourseUnit.controller');
const ProgrammeVersionOptionsController = require('./ProgrammeManager/programmeVersionOptions.controller');

// Admissions Portal
const ApplicantController = require('./Admissions/applicant.controller');
const ApplicantAuthController = require('./AdmissionPortal/applicantAuth.controller');
const AcademicDocuments = require('./AcademicDocuments');
const StudentPortal = require('./StudentPortal');
const InstitutionPolicy = require('./InstitutionPolicy');
const Verifications = require('./Verification');
const TwoFactorAuthenticationController = require('./App/twoFactorAuth.controller');

module.exports = {
  appController,
  ProgrammeController,
  CollegeController,
  UserController,
  facultyController,
  departmentController,
  CourseUnitController,
  SubjectController,
  UnebSubjectController,
  SubjectCombinationController,
  ProgrammeVersionController,
  SpecializationController,
  MetadataValueController,
  MetadataController,
  ProgrammeVersionPlanController,
  GradingController,
  GradingValueController,
  ApplicationController,
  ProgVersAdmCriteriaController,
  SemesterLoadController,
  SecurityProfileController,
  AppFunctionController,
  StudentController,
  InstitutionStructureController,
  DocumentSettingController,
  ProgrammesReportsController,
  StudentsReportsController,
  ProgrammeVersionCourseUnitController,
  ProgrammeVersionOptionsController,
  ApplicantController,
  ApplicantAuthController,
  TwoFactorAuthenticationController,
  ...AcademicDocuments,
  ...StudentPortal,
  ...InstitutionPolicy,
  ...Verifications,
};
