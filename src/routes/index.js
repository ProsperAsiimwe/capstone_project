const router = require('express').Router();
const appRouter = require('./App');
const programmeRouter = require('./ProgrammeManager');
const eventsRouter = require('./EventScheduler');
const feesRouter = require('./FeesManager');
const courseAssignmentRouter = require('./courseAssignment');
const universalPaymentsRouter = require('./UniversalPayments');
const resultsRouter = require('./Result');
const studentMgtRouter = require('./StudentRecords');
const userMgtRouter = require('./UserAccess');
const NTCMgtRouter = require('./NTCMgt');
const userAuthRouter = require('./Auth');
const admissionsMgtRouter = require('./Admissions');
const pujabRouter = require('./Pujab');
const admissionPortalRouter = require('./AdmissionPortal');
const admissionPortalAuthRouter = require('./AdmissionPortal/authentication');
const studentPortalMgtRouter = require('./StudentsPortal');
const registrationAndEnrollmentMgtRouter = require('./EnrollmentAndRegistration');
const institutionPolicyRouter = require('./InstitutionPolicy');
const loginRequired = require('@middleware/authRoute');
const applicantLoginRequired = require('@middleware/authRouteApplicant');
const mailRouter = require('./MailManager');
const academicDocumentRouter = require('./AcademicDocuments');
const biReportRouter = require('./BI-reporting');
const openDocumentRoute = require('./AcademicDocuments/openDocument');
const biometricRoute = require('./Biometrics');
const eVotingRoute = require('./EVoting/index');

// api
const clientRouter = require('./Api');
const { PrintDocumentController } = require('@controllers/AcademicDocuments');
const verificationRouter = require('./Verification');

const controller = new PrintDocumentController();

// All routes shall be added here
const prefix = '/api/v1';

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'TERP API DOCUMENTATION', version: '1.0.0' });
});

/* GET home page. */
router.use(`${prefix}/academic-documents`, openDocumentRoute);
router.use(`${prefix}/biometrics`, biometricRoute);
router.use(`${prefix}/e-voting`, eVotingRoute);
router.use('/print', controller.renderTranscriptView);
router.use(
  `${prefix}/academic-documents`,
  [loginRequired],
  academicDocumentRouter
);
router.use(`${prefix}/app`, appRouter);
router.use(`${prefix}/programme-mgt`, [loginRequired], programmeRouter);
router.use(`${prefix}/events-mgt`, [loginRequired], eventsRouter);
router.use(`${prefix}/fees-mgt`, [loginRequired], feesRouter);
router.use(
  `${prefix}/course-assignment`,
  [loginRequired],
  courseAssignmentRouter
);
router.use(`${prefix}/universal-payments`, universalPaymentsRouter);
router.use(`${prefix}/results-mgt`, resultsRouter);
router.use(`${prefix}/bi`, biReportRouter);
router.use(`${prefix}/students-mgt`, [loginRequired], studentMgtRouter);
router.use(`${prefix}/users/auth`, userAuthRouter);
router.use(`${prefix}/users`, [loginRequired], userMgtRouter);
router.use(`${prefix}/ntc-mgt`, [loginRequired], NTCMgtRouter);
router.use(`${prefix}/admissions`, admissionsMgtRouter);
router.use(`${prefix}/pujab`, pujabRouter);
router.use(
  `${prefix}/registration`,
  [loginRequired],
  registrationAndEnrollmentMgtRouter
);
router.use(
  `${prefix}/institution-policy-mgt`,
  [loginRequired],
  institutionPolicyRouter
);
router.use(`${prefix}`, mailRouter);

// ADMISSIONS PORTAL
router.use(`${prefix}/applicants/auth`, admissionPortalAuthRouter);
router.use(
  `${prefix}/applicants`,
  [applicantLoginRequired],
  admissionPortalRouter
);

// All STudent Portal Routes
router.use(`${prefix}/student-portal`, studentPortalMgtRouter);

// api
router.use(`${prefix}/developer`, clientRouter);
router.use(`${prefix}/verifications`, verificationRouter);

module.exports = router;
