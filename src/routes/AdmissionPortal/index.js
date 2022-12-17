const { Router } = require('express');
const metadataRouter = require('./metadata');
const runningAdmissionRoute = require('./runningAdmissionRoute');
const UNEBAPIRoute = require('./UNEBAPIRoute');
const applicantDataRoute = require('./applicantDataRoute');
const applicantALevelDataRoute = require('./applicantALevelDataRoute');
const applicantAttachmentRoute = require('./applicantAttachmentRoute');
const applicantBioDataRoute = require('./applicantBioDataRoute');
const applicantNextOfKinRoute = require('./applicantNextOfKinRoute');
const applicantOLevelDataRoute = require('./applicantOLevelDataRoute');
const applicantRelevantQualificationRouter = require('./applicantRelevantQualificationRoute');
const applicantOtherQualificationRoute = require('./applicantOtherQualificationRoute');
const applicantDiplomaQualificationRoute = require('./applicantDiplomaQualificationRoute');
const applicantPermanentAddressRoute = require('./applicantPermanentAddressRoute');
const applicantProgrammeChoiceRoute = require('./applicantProgrammeChoiceRoute');
const applicantEmploymentRecordRoute = require('./applicantEmploymentRecordRoute');
const applicantRefereeDetailRoute = require('./applicantRefereeDetailRoute');
const runningAdmissionApplicantRoute = require('./runningAdmissionApplicantRoute');
const admissionProgrammesRoute = require('./admissionProgrammesRoute');
const applicantCertificateQualificationRoute = require('./applicantCertificateQualificationRoute');
const applicantBachelorsQualificationRoute = require('./applicantBachelorsQualificationRoute');
const applicantMastersQualificationRoute = require('./applicantMastersQualificationRoute');
const admissionRouter = require('./admissionRoute');

const applicantsMgtRouter = Router();

//  APPLICANTS' PORTAL ENDPOINTS
applicantsMgtRouter.use('/meta-data', metadataRouter);
applicantsMgtRouter.use('/uneb-results', UNEBAPIRoute);
applicantsMgtRouter.use('/running-admissions', runningAdmissionRoute);
applicantsMgtRouter.use('/applicant-data', applicantDataRoute);
applicantsMgtRouter.use('/a-level-data', applicantALevelDataRoute);
applicantsMgtRouter.use('/attachments', applicantAttachmentRoute);
applicantsMgtRouter.use('/bio-data', applicantBioDataRoute);
applicantsMgtRouter.use('/next-of-kin', applicantNextOfKinRoute);
applicantsMgtRouter.use('/o-level-data', applicantOLevelDataRoute);
applicantsMgtRouter.use(
  '/relevant-qualifications',
  applicantRelevantQualificationRouter
);
applicantsMgtRouter.use(
  '/other-qualifications',
  applicantOtherQualificationRoute
);
applicantsMgtRouter.use(
  '/diploma-qualifications',
  applicantDiplomaQualificationRoute
);
applicantsMgtRouter.use(
  '/certificate-qualifications',
  applicantCertificateQualificationRoute
);
applicantsMgtRouter.use(
  '/bachelors-qualifications',
  applicantBachelorsQualificationRoute
);
applicantsMgtRouter.use(
  '/masters-qualifications',
  applicantMastersQualificationRoute
);
applicantsMgtRouter.use('/permanent-address', applicantPermanentAddressRoute);
applicantsMgtRouter.use('/programme-choices', applicantProgrammeChoiceRoute);
applicantsMgtRouter.use('/employment-records', applicantEmploymentRecordRoute);
applicantsMgtRouter.use('/referee-details', applicantRefereeDetailRoute);
applicantsMgtRouter.use(
  '/running-admissions-applicants',
  runningAdmissionApplicantRoute
);
applicantsMgtRouter.use('/admissions', admissionRouter);

applicantsMgtRouter.use('/admission-programmes', admissionProgrammesRoute);
module.exports = applicantsMgtRouter;
