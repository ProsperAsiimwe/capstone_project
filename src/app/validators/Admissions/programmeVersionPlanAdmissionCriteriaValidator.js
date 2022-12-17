const { JoiValidator } = require('@middleware');
const {
  programmeVersionPlanAdmissionCriteriaSchema,
} = require('../schema/Admissions');

const validateCreateProgrammeVersionPlanAdmissionCriteria = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    programmeVersionPlanAdmissionCriteriaSchema.createProgrammeVersionPlanAdmissionCriteriaSchema
  );
};

const validateUpdateProgrammeVersionPlanAdmissionCriteria = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    programmeVersionPlanAdmissionCriteriaSchema.updateProgrammeVersionPlanAdmissionCriteriaSchema
  );
};

module.exports = {
  validateCreateProgrammeVersionPlanAdmissionCriteria,
  validateUpdateProgrammeVersionPlanAdmissionCriteria,
};
