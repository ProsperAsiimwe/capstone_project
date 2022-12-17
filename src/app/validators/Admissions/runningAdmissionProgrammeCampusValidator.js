const { JoiValidator } = require('@middleware');
const {
  runningAdmissionProgrammeCampusSchema,
} = require('../schema/Admissions');

const validateCreateRunningAdmissionProgrammeCampus = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    runningAdmissionProgrammeCampusSchema.createRunningAdmissionProgrammeCampusSchema
  );
};

const validateUpdateRunningAdmissionProgrammeCampus = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    runningAdmissionProgrammeCampusSchema.updateRunningAdmissionProgrammeCampusSchema
  );
};

const validateUpdateRunningAdmissionProgrammeSpecialRemarks = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    runningAdmissionProgrammeCampusSchema.updateRunningAdmissionProgrammeSpecialRemarks
  );
};

const validateUpdateCapacitySettingSpecialFees = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    runningAdmissionProgrammeCampusSchema.updateRunningAdmissionProgrammeSpecialFees
  );
};

const validateCreateRunningAdmissionProgrammeSpecialFees = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    runningAdmissionProgrammeCampusSchema.createRunningAdmissionProgrammeSpecialFeesSchema
  );
};

const validateCreateRunningAdmissionProgrammeSpecialRemarks = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    runningAdmissionProgrammeCampusSchema.createRunningAdmissionProgrammeSpecialRemarks
  );
};

const validateCreateSingleCapacitySetting = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    runningAdmissionProgrammeCampusSchema.createSingleCapacitySettingSchema
  );
};

module.exports = {
  validateCreateRunningAdmissionProgrammeCampus,
  validateCreateSingleCapacitySetting,
  validateCreateRunningAdmissionProgrammeSpecialFees,
  validateCreateRunningAdmissionProgrammeSpecialRemarks,
  validateUpdateRunningAdmissionProgrammeCampus,
  validateUpdateRunningAdmissionProgrammeSpecialRemarks,
  validateUpdateCapacitySettingSpecialFees,
};
