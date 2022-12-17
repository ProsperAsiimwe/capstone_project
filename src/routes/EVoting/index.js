const ElectivePositionController = require('@controllers/Evoting/electivePosition.controller');
const loginRequired = require('@root/app/middleware/authRoute');
const { Router } = require('express');

const controller = new ElectivePositionController();

// E-VOTING API Endpoints
const eVotingRoutes = Router();

eVotingRoutes.get('/elective-positions', [loginRequired], controller.findAll);
eVotingRoutes.post('/elective-positions', [loginRequired], controller.create);
eVotingRoutes.get(
  '/elective-positions/eligible/:positionId/:programmeId',
  [loginRequired],
  controller.getEligibleProgrammeStudents
);
eVotingRoutes.get(
  '/elective-positions/verified/:positionId/:programmeId',
  [loginRequired],
  controller.getVerifiedVotingStudents
);
eVotingRoutes.post(
  '/elective-positions/mark-as-verified/:positionId/:programmeId',
  [loginRequired],
  controller.markStudentsVerified
);
eVotingRoutes.get(
  '/elective-positions/:id',
  [loginRequired],
  controller.findOne
);

module.exports = eVotingRoutes;
