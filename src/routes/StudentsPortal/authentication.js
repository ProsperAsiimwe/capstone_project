const { Router } = require('express');
const { StudentController } = require('@controllers/StudentRecords');
const { authValidator } = require('@validators/UserAccess');
const { studentValidator } = require('@validators/StudentRecords');
const studentLoginRequired = require('../../app/middleware/authRouteStudent');

const controller = new StudentController();
const authRouter = Router();

// Student Authentication API
authRouter.post(
  '/login',
  [authValidator.validateStudentLogin],
  controller.login
);
authRouter.post('/logout', [studentLoginRequired], controller.logout);
authRouter.get(
  '/profile',
  [studentLoginRequired],
  controller.getAuthStudentProfile
);
authRouter.get(
  '/account-balance',
  [studentLoginRequired],
  controller.getAuthStudentBalance
);
authRouter.get(
  '/academic-records',
  [studentLoginRequired],
  controller.findStudentAcademicRecords
);
authRouter.put(
  '/change-password',
  [studentLoginRequired],
  [studentValidator.validateUpdateStudentPassword],
  controller.updateStudentPassword
);
authRouter.post(
  '/request-token',
  [authValidator.validateRequestOTPStudent],
  controller.sendPasswordResetToken
);

authRouter.put(
  '/reset-password',
  [authValidator.validateResetStudentPassword],
  controller.resetStudentPassword
);

authRouter.put(
  '/edit-contact',
  [studentLoginRequired],
  [authValidator.validateEditStudentContacts],
  controller.editStudentContacts
);

module.exports = authRouter;
