const { Router } = require('express');
const registrationPolicyRouter = require('./registrationPolicyRoutes');
const otherFeesPolicyRouter = require('./otherFeesPolicyRoutes');
const retakersFeesPolicyRouter = require('./retakersFeesPolicyRoutes');
const surchargePolicyRouter = require('./surchargePolicyRoutes');
const resultsPolicyRouter = require('./resultsPolicyRoutes');
const academicYearFeesPolicyRouter = require('./academicYearFeesPolicyRoutes');
const applicationFeesPolicyRouter = require('./applicationFeesPolicyRoutes');
const admissionFeesPolicyRouter = require('./admissionFeesPolicyRoutes');
const resultCategoryPolicyRouter = require('./resultCategoryPolicyRoutes');
const documentVerificationPolicyRouter = require('./documentVerificationPolicyRoutes');
const enrollmentAndRegistrationHistoryPolicyRouter = require('./enrollmentAndRegistrationHistoryPolicyRoutes');
const hallAllocationPolicyRoutes = require('./hallAllocationPolicyRoutes');
const studentServicePolicyRoutes = require('./studentServicePolicyRoutes');
const concededPassPolicyRouter = require('./concededPassPolicyRoutes');
const graduateFeesPolicyRoutes = require('./graduateFeesPolicyRoutes');

//  APP Module Endpoints
const institutionPolicyRouter = Router();

institutionPolicyRouter.use('/registration-policies', registrationPolicyRouter);

institutionPolicyRouter.use('/other-fees-policies', otherFeesPolicyRouter);

institutionPolicyRouter.use('/retaker-fees-policies', retakersFeesPolicyRouter);

institutionPolicyRouter.use('/surcharge-policies', surchargePolicyRouter);

institutionPolicyRouter.use('/results-policies', resultsPolicyRouter);

institutionPolicyRouter.use(
  '/result-category-policies',
  resultCategoryPolicyRouter
);

institutionPolicyRouter.use(
  '/conceded-pass-policies',
  concededPassPolicyRouter
);

institutionPolicyRouter.use(
  '/academic-year-fees-policies',
  academicYearFeesPolicyRouter
);

institutionPolicyRouter.use(
  '/application-fees-policies',
  applicationFeesPolicyRouter
);

institutionPolicyRouter.use(
  '/admission-fees-policies',
  admissionFeesPolicyRouter
);

institutionPolicyRouter.use(
  '/document-verification-policies',
  documentVerificationPolicyRouter
);

institutionPolicyRouter.use(
  '/enrollment-and-registration-history-policies',
  enrollmentAndRegistrationHistoryPolicyRouter
);

institutionPolicyRouter.use(
  '/hall-allocation-policies',
  hallAllocationPolicyRoutes
);

institutionPolicyRouter.use(
  '/student-service-policies',
  studentServicePolicyRoutes
);

institutionPolicyRouter.use(
  '/graduate-fees-policies',
  graduateFeesPolicyRoutes
);

module.exports = institutionPolicyRouter;
