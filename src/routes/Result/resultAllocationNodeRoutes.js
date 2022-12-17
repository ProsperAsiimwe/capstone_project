const express = require('express');
const {
  ResultAllocationNodeController,
  CourseAssignmentController,
  TestimonialController,
  GpaAlgorithmController,
  TranscriptController,
  ManageStudentResultController,
} = require('@controllers/Result');

const { resultAllocationNodeValidator } = require('@validators/Results');

const resultAllocationNodeRouter = express.Router();
const controller = new ResultAllocationNodeController();
const nodeController = new CourseAssignmentController();
const testimonialController = new TestimonialController();
const gpaController = new GpaAlgorithmController();
const transcriptController = new TranscriptController();
const manageController = new ManageStudentResultController();

resultAllocationNodeRouter.get('/', controller.index);

resultAllocationNodeRouter.get(
  '/course-nodes',
  nodeController.courseNodeAssignment
);

resultAllocationNodeRouter.get('/assessment-nodes', nodeController.courseNodes);

resultAllocationNodeRouter.get(
  '/upload-lecturers',
  nodeController.marksUploadLecturer
);

resultAllocationNodeRouter.get('/node-marks', nodeController.studentNodeMarks);

resultAllocationNodeRouter.get('/results-view', nodeController.resultView);

resultAllocationNodeRouter.get(
  '/testimonial-results',
  testimonialController.testimonialResultView
);
resultAllocationNodeRouter.get(
  '/search-results',
  testimonialController.searchAllStudentResults
);

resultAllocationNodeRouter.get(
  '/transcripts',
  transcriptController.transcriptResultView
);

// GpaAlgorithmController
resultAllocationNodeRouter.get('/gpa', gpaController.singleStudentGpa);

// departmentMarkApproval
resultAllocationNodeRouter.get(
  '/department-approval',
  nodeController.departmentMarkApproval
);
resultAllocationNodeRouter.post(
  '/',
  [resultAllocationNodeValidator.validateCreateNode],
  controller.createResultAllocationNode
);

// manageController
resultAllocationNodeRouter.post(
  '/deactivate-results',
  // [resultAllocationNodeValidator.validateCreateNode],
  manageController.deactivatedStudentResults
);

resultAllocationNodeRouter.post(
  '/download-template/:nodeId',
  controller.downloadNodeResultsUploadTemplate
);

resultAllocationNodeRouter.post(
  '/upload-template/:nodeId',
  controller.uploadNodeResults
);

resultAllocationNodeRouter.post(
  '/submit-node-by-lecturer/:nodeId',
  controller.submitNodeByLecturer
);

resultAllocationNodeRouter.post(
  '/submit-node-by-hod/:nodeId',
  controller.approveNodeByHeadOfDepartment
);

// resultAllocationNodeRouter.post(
//   '/submit-node-by-registrar/:nodeId',
//   controller.approveNodeByRegistrar
// );

resultAllocationNodeRouter.put(
  '/:id',
  [resultAllocationNodeValidator.validateCreateNode],
  controller.updateResultAllocationNode
);

resultAllocationNodeRouter.delete(
  '/:id',
  controller.deleteResultAllocationNode
);

module.exports = resultAllocationNodeRouter;
