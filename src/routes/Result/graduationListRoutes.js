const express = require('express');
const {
  GraduationListController,
  GraduationDataController,
  GenerateGpaController,
  GraduationDetailsController,
  SearchStudentResultsController,
  GraduatedStudentsController,
} = require('@controllers/Result');

const graduationListRouter = express.Router();

const { graduationListValidator } = require('@validators/Results');

const graduationController = new GraduationListController();
const dataController = new GraduationDataController();
const generateGpaController = new GenerateGpaController();
const graduationDetails = new GraduationDetailsController();
const singleStudentSearch = new SearchStudentResultsController();
const graduatedStudents = new GraduatedStudentsController();

graduationListRouter.get('/departments', dataController.departmentsBySchool);

graduationListRouter.get('/programmes', dataController.programmesByDepartment);

graduationListRouter.get('/list', graduationController.graduationListFunction);

// graduationList

graduationListRouter.get(
  '/draft-list',
  graduationController.provisionalGraduationList
);

graduationListRouter.get('/finalists', graduationController.fetchToProvisional);

graduationListRouter.get('/final-list', graduationController.graduationList);

graduationListRouter.get(
  '/single-student',
  singleStudentSearch.testimonialResultView
);

graduationListRouter.get(
  '/search-student',
  graduationController.searchStudentProvisionalList
);

// generateProvisionalFunction

graduationListRouter.get(
  '/generate-provisional',
  graduationController.generateProvisionalFunction
);

// graduated  students

graduationListRouter.get(
  '/graduated-students',
  graduatedStudents.graduatedStudent
);

graduationListRouter.post(
  '/download-draft-list',
  graduationController.downloadDraftGraduationListFunction
);

graduationListRouter.post(
  '/download-final-list',
  graduationController.downloadFinalGraduationListFunction
);

// generateStudentGpa
graduationListRouter.post(
  '/generate-academic-grades',
  generateGpaController.generateStudentGpa
);

// generate grades for single student
graduationListRouter.post(
  '/generate-single-student-academic-grades',
  generateGpaController.generateSingleStudentGrades
);

// studentGpaList
graduationListRouter.get('/student-list', generateGpaController.studentGpaList);
// graduation details

graduationListRouter.get('/details', graduationDetails.graduationDetails);

graduationListRouter.post(
  '/provisional-graduation-list',
  [graduationListValidator.validateProvisionalAcademicYear],
  graduationController.provisionalGradList
);

graduationListRouter.post(
  '/administrative-provisional-graduation-list',
  [graduationListValidator.validateProvisionalGradList],
  graduationController.administrativeProvisionalGradList
);

graduationListRouter.post(
  '/push-to-provisional',
  [graduationListValidator.validatePushToProvisionalSchema],
  graduationController.selectPushToProvisional
);

graduationListRouter.post(
  '/push-to-graduation-list',
  [graduationListValidator.validatePushToGraduationList],
  graduationController.pushStudentsToGraduationList
);

graduationListRouter.post(
  '/graduate-students',
  [graduationListValidator.validateGraduateStudents],
  graduationController.graduateStudents
);

graduationListRouter.post(
  '/bill-students',
  [graduationListValidator.validateBillStudentsOnGraduationList],
  graduationController.billStudentsOnGraduationList
);

graduationListRouter.post(
  '/download-bulk-billing-template',
  graduationController.downloadBulkBillingTemplate
);

graduationListRouter.post(
  '/upload-bulk-billing-template',
  graduationController.uploadBulkGraduationListBillingTemplate
);

graduationListRouter.put(
  '/update-provisional-list',
  [graduationListValidator.validateUpdateGraduationListAcademicYear],
  graduationController.updateGraduationListAcademicYear
);

graduationListRouter.delete(
  '/remove-from-provisional-list',
  [graduationListValidator.validateUpdateGraduationListAcademicYear],
  graduationController.removeFromProvisionalList
);

graduationListRouter.delete(
  '/remove-from-final-list',
  [graduationListValidator.validateUpdateFinalGraduationListYear],
  graduationController.removeFromFinalList
);

module.exports = graduationListRouter;
