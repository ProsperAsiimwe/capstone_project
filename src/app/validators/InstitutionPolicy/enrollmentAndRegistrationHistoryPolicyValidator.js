const { JoiValidator } = require('@middleware');
const {
  enrollmentAndRegistrationHistoryPolicySchema,
} = require('../schema/InstitutionPolicy');

const validateCreateEnrollmentAndRegistrationHistoryPolicy = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    enrollmentAndRegistrationHistoryPolicySchema.createEnrollmentAndRegistrationHistoryPolicySchema
  );
};

const validateUpdateEnrollmentAndRegistrationHistoryPolicy = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    enrollmentAndRegistrationHistoryPolicySchema.updateEnrollmentAndRegistrationHistoryPolicySchema
  );
};

module.exports = {
  validateCreateEnrollmentAndRegistrationHistoryPolicy,
  validateUpdateEnrollmentAndRegistrationHistoryPolicy,
};
