const { JoiValidator } = require('@middleware');
const { applicantProgrammeChoiceSchema } = require('../schema/Admissions');

const validateCreateApplicantProgrammeChoice = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantProgrammeChoiceSchema.createApplicantProgrammeChoiceSchema
  );
};

const validateUpdateApplicantProgrammeChoice = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantProgrammeChoiceSchema.updateApplicantProgrammeChoiceSchema
  );
};

const validateUpdateAdmittedApplicant = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantProgrammeChoiceSchema.updateAdmittedApplicantSchema
  );
};

const validateGeneratePRNByStaff = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantProgrammeChoiceSchema.generatePRNByStaffSchema
  );
};

module.exports = {
  validateCreateApplicantProgrammeChoice,
  validateUpdateApplicantProgrammeChoice,
  validateUpdateAdmittedApplicant,
  validateGeneratePRNByStaff,
};
