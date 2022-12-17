const express = require('express');
const {
  StudentServicePolicyController,
} = require('@controllers/InstitutionPolicy');
const {
  studentServicePolicyValidator,
} = require('@validators/InstitutionPolicy');

const studentServicePolicyRouter = express.Router();
const controller = new StudentServicePolicyController();

studentServicePolicyRouter.get('/', controller.index);

studentServicePolicyRouter.post(
  '/',
  [studentServicePolicyValidator.validateCreateStudentServicePolicy],
  controller.createStudentServicePolicy
);

studentServicePolicyRouter.put(
  '/:id',
  [studentServicePolicyValidator.validateCreateStudentServicePolicy],
  controller.updateStudentServicePolicy
);
studentServicePolicyRouter.delete(
  '/:id',
  controller.deleteStudentServicePolicy
);

module.exports = studentServicePolicyRouter;
