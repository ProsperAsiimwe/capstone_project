const express = require('express');
const { StudentServiceController } = require('@controllers/StudentRecords');
const { studentServiceValidator } = require('@validators/StudentRecords');

const studentServiceRouter = express.Router();
const controller = new StudentServiceController();

studentServiceRouter.get('/', controller.index);

studentServiceRouter.post(
  '/:studentId',
  [studentServiceValidator.validateCreateStudentService],
  controller.createStudentService
);

studentServiceRouter.post(
  '/approve/:serviceId',
  [studentServiceValidator.validateCreateStudentService],
  controller.approveStudentServiceRequest
);

studentServiceRouter.post(
  '/generate-prn/:serviceId',
  controller.generateStudentServicePRN
);

module.exports = studentServiceRouter;
