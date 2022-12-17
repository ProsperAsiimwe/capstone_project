const { JoiValidator } = require('@middleware');
const {
  programmeVersionWeightingCriteriaSchema,
} = require('../schema/Admissions');

const validateCreateProgrammeVersionWeightingCriteria = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    programmeVersionWeightingCriteriaSchema.createProgrammeVersionWeightingCriteriaSchema
  );
};

const validateUpdateProgrammeVersionWeightingCriteria = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    programmeVersionWeightingCriteriaSchema.updateProgrammeVersionWeightingCriteriaSchema
  );
};

const validateAddWeightingCriteriaCategory = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    programmeVersionWeightingCriteriaSchema.addWeightingCriteriaCategorySchema
  );
};

const validateAddWeightingCriteriaCategorySubjects = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    programmeVersionWeightingCriteriaSchema.addWeightingCriteriaCategorySubjectsSchema
  );
};

const validateUpdateWeightingCriteriaCategory = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    programmeVersionWeightingCriteriaSchema.updateWeightingCriteriaCategorySchema
  );
};

module.exports = {
  validateCreateProgrammeVersionWeightingCriteria,
  validateUpdateProgrammeVersionWeightingCriteria,
  validateAddWeightingCriteriaCategory,
  validateAddWeightingCriteriaCategorySubjects,
  validateUpdateWeightingCriteriaCategory,
};
