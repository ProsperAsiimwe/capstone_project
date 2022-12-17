const { JoiValidator } = require('@middleware');
const {
  programmeVersionSelectionCriteriaSchema,
} = require('../schema/Admissions');

const validateCreateProgrammeVersionSelectionCriteria = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    programmeVersionSelectionCriteriaSchema.createProgrammeVersionSelectionCriteriaSchema
  );
};

const validateUpdateProgrammeVersionSelectionCriteria = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    programmeVersionSelectionCriteriaSchema.updateProgrammeVersionSelectionCriteriaSchema
  );
};

const validateAddWeightingCriteriaStudyType = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    programmeVersionSelectionCriteriaSchema.addWeightingCriteriaStudyTypeSchema
  );
};

const validateUpdateWeightingCriteriaStudyType = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    programmeVersionSelectionCriteriaSchema.updateWeightingCriteriaStudyTypeSchema
  );
};

module.exports = {
  validateCreateProgrammeVersionSelectionCriteria,
  validateUpdateProgrammeVersionSelectionCriteria,
  validateAddWeightingCriteriaStudyType,
  validateUpdateWeightingCriteriaStudyType,
};
