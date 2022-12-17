const { Router } = require('express');
const loginRequired = require('../../app/middleware/authRoute');
const programmeVersionWeightingCriteriaRoute = require('./programmeVersionWeightingCriteriaRoute');
const programmeVersionSelectionCriteriaRoute = require('./programmeVersionSelectionCriteriaRoute');
const programmeVersionPlanAdmissionCriteriaRoute = require('./programmeVersionPlanAdmissionCriteriaRoute');
const runningAdmissionRoute = require('./runningAdmissionRoute');
const runningAdmissionProgrammeRoute = require('./runningAdmissionProgrammeRoute');
const runningAdmissionProgrammeCampusRoute = require('./runningAdmissionProgrammeCampusRoute');
const admissionFormRoute = require('./admissionFormRoute');
const admissionSchemeRoute = require('./admissionSchemeRoute');
const runningAdmissionApplicantRoute = require('./runningAdmissionApplicantRoute');
const migratedApplicantsRoute = require('./migratedApplicantsRoute');
const admittedApplicantsViewsRoute = require('./admittedApplicantViewRoute');
const changeOfProgrammeRoutes = require('./changeOfProgrammeRoutes');

const reportRoute = require('./AdmissionReportRoute');
const searchRoute = require('./searchApplicantsRoute');

const admissionsMgtRouter = Router();

// create and fetch applicant route
admissionsMgtRouter.use(
  '/weighting-criteria',
  [loginRequired],
  programmeVersionWeightingCriteriaRoute
);
admissionsMgtRouter.use(
  '/selection-criteria',
  [loginRequired],
  programmeVersionSelectionCriteriaRoute
);
admissionsMgtRouter.use(
  '/programme-version-plan-admission-criteria',
  [loginRequired],
  programmeVersionPlanAdmissionCriteriaRoute
);
admissionsMgtRouter.use(
  '/running-admissions',
  [loginRequired],
  runningAdmissionRoute
);
admissionsMgtRouter.use(
  '/running-admission-programmes',
  [loginRequired],
  runningAdmissionProgrammeRoute
);
admissionsMgtRouter.use(
  '/running-admission-programme-campuses',
  [loginRequired],
  runningAdmissionProgrammeCampusRoute
);
admissionsMgtRouter.use(
  '/admission-forms',
  [loginRequired],
  admissionFormRoute
);
admissionsMgtRouter.use(
  '/admission-schemes',
  [loginRequired],
  admissionSchemeRoute
);
admissionsMgtRouter.use(
  '/running-admission-applicant',
  [loginRequired],
  runningAdmissionApplicantRoute
);
admissionsMgtRouter.use(
  '/migrated-applicants',
  [loginRequired],
  migratedApplicantsRoute
);

admissionsMgtRouter.use('/admission-reports', [loginRequired], reportRoute);

admissionsMgtRouter.use('/search-applicants', [loginRequired], searchRoute);

admissionsMgtRouter.use(
  '/admitted',
  [loginRequired],
  admittedApplicantsViewsRoute
);
admissionsMgtRouter.use(
  '/change-of-programmes',
  [loginRequired],
  changeOfProgrammeRoutes
);

module.exports = admissionsMgtRouter;
