const express = require('express');
const {
  MigratedEnrollmentRecordsController,
} = require('@controllers/EnrollmentAndRegistration');
const migratedEnrollmentRouter = express.Router();

const controller = new MigratedEnrollmentRecordsController();

migratedEnrollmentRouter.get('/', controller.migratedEnrollments);

migratedEnrollmentRouter.get(
  '/enrollment-balances',
  controller.tuitionBalancesProgramme
);

module.exports = migratedEnrollmentRouter;
