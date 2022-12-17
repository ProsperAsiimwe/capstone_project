const express = require('express');
const {
  StudentApprovalsController,
  StudentBatchesController,
} = require('@controllers/StudentRecords');
const { studentValidator } = require('@validators/StudentRecords');

const studentApprovalRouter = express.Router();
const controller = new StudentApprovalsController();
const studentBatches = new StudentBatchesController();

// Student Management Routes.
studentApprovalRouter.get('/show', controller.index);

studentApprovalRouter.get(
  '/uploaded-batches',
  controller.uploadedStudentsApprovalFunction
);

//  student batches
studentApprovalRouter.get(
  '/student-batches',
  studentBatches.studentsBatchByDate
);

studentApprovalRouter.get('/batches-user', studentBatches.studentsBatchByUser);

studentApprovalRouter.get('/upload-user', studentBatches.uploadUsers);

// changeProgrammePending
studentApprovalRouter.get(
  '/pending-change-programme',
  studentBatches.changeProgrammePending
);

// uploaded students
studentApprovalRouter.get(
  '/uploaded-students',
  controller.uploadedStudentsByBatchNumberFunction
);
studentApprovalRouter.post(
  '/',
  [studentValidator.validateApproveStudentCreation],
  controller.approveStudents
);
studentApprovalRouter.post(
  '/approve-by-batch',
  controller.approveStudentsByBatch
);

module.exports = studentApprovalRouter;
