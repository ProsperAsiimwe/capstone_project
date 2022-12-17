const { JoiValidator } = require('@middleware');
const { runningAdmissionProgrammeSchema } = require('../schema/Admissions');

const validateCreateRunningAdmissionProgramme = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    runningAdmissionProgrammeSchema.createRunningAdmissionProgrammeSchema
  );
};

const validateUpdateRunningAdmissionProgramme = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    runningAdmissionProgrammeSchema.updateRunningAdmissionProgrammeSchema
  );
};

const validateManageMultipleRunningAdmissionProgramme = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    runningAdmissionProgrammeSchema.manageMultipleRunningAdmissionProgrammeSchema
  );
};

module.exports = {
  validateCreateRunningAdmissionProgramme,
  validateUpdateRunningAdmissionProgramme,
  validateManageMultipleRunningAdmissionProgramme,
};
