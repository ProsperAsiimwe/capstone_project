const express = require('express');
const { StudentController } = require('@controllers/StudentRecords');
const { studentValidator } = require('@validators/StudentRecords');

const studentRouter = express.Router();
const controller = new StudentController();

// Student Management Routes.
studentRouter.get('/', controller.index);

studentRouter.post(
  '/',
  [studentValidator.validateCreateStudent],
  controller.createStudent
);

// student
studentRouter.post('/students-data', controller.fetchStudentsByContext);

// Fetch Student
studentRouter.post('/prog-students', controller.findStudentsByProgAndAcadYear);

// Update Students Prog Versions
studentRouter.put('/prog-version', controller.updateStudentProgrammeVersions);

// Update Students Account Status
studentRouter.put(
  '/account-status',
  [studentValidator.validateUpdateStudentAccountStatus],
  controller.updateStudentsAccountStatus
);

studentRouter.get('/:id', controller.fetchStudent);
studentRouter.put(
  '/personal-details/:studentId',
  [studentValidator.validateUpdateStudentPersonalDetails],
  controller.updateStudentPersonalDetails
);

studentRouter.put(
  '/academic-records/:studentId/:studentProgrammeId',
  [studentValidator.validateUpdateStudentAcademicDetails],
  controller.updateStudentAcademicRecords
);

studentRouter.put(
  '/current-student-programme/:studentId/:studentProgrammeId',
  controller.updateCurrentStudentProgramme
);

studentRouter.put(
  '/sponsorship-records/:studentId/:studentProgrammeId',
  [studentValidator.validateUpdateStudentSponsorshipDetails],
  controller.updateStudentSponsorshipRecords
);

studentRouter.put(
  '/document-verification/:studentNumber/:studentProgrammeId',
  [studentValidator.validateStudentDocumentVerification],
  controller.updateStudentDocumentVerification
);

studentRouter.delete('/delete-from-srm', controller.deleteStudentsFromSRM);
studentRouter.delete('/:id', controller.deleteStudent);
// student
// studentRouter.get('/students-data', controller.fetchStudentsByContext);

// upload students template
studentRouter.post('/upload', controller.uploadStudents);

studentRouter.post('/verify-student-template', controller.verifyStudentUploads);

// download student's template
studentRouter.post('/download-template', controller.downloadTemplate);

// download bulk update student
studentRouter.post(
  '/download-bulk-update-template',
  controller.downloadBulkUpdateTemplate
);

// upload bulk update student
studentRouter.post(
  '/upload-bulk-update-template',
  controller.uploadBulkUpdateStudents
);

//
studentRouter.post(
  '/push-applicants-to-sic',
  [studentValidator.validatePushStudentsToSIC],
  controller.pushStudentsToSIC
);

//
studentRouter.post(
  '/download-not-pushed-applicants',
  controller.downloadNotPushedToSICReport
);

//
studentRouter.post(
  '/push-applicants-as-previous-students',
  [studentValidator.validatePushStudentsToSIC],
  controller.pushApplicantsToSICAsPreviousStudents
);

// create student's academic status
studentRouter.post(
  '/academic-status/:studentId',
  [studentValidator.validateStudentAcademicStatus],
  controller.createStudentAcademicStatus
);

// Track student's academic status
studentRouter.get(
  '/academic-status/fetch/:studentId',
  controller.fetchStudentAcademicStatusRecords
);

studentRouter.post(
  '/password-reset-token/:regOrStdNumber',
  controller.resetStudentPasswordByStaff
);

studentRouter.post(
  '/upload-avatar/:studentNumber',
  controller.uploadStudentAvatar
);

module.exports = studentRouter;
