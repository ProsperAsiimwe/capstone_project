const { JoiValidator } = require('@middleware');
const { resultsPolicySchema } = require('../schema/InstitutionPolicy');

const validateCreateCourseResittingPolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    resultsPolicySchema.courseResittingPolicySchema
  );
};

const validateCreateStudyLevelPassMarkPolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    resultsPolicySchema.studyLevelPassMarkPolicySchema
  );
};

const validateCreateStudyLevelDegreeClass = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    resultsPolicySchema.studyLevelDegreeClassSchema
  );
};

const validateCreateStudyLevelDegreeClassAllocation = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    resultsPolicySchema.studyLevelDegreeClassAllocationSchema
  );
};

module.exports = {
  validateCreateCourseResittingPolicy,
  validateCreateStudyLevelPassMarkPolicy,
  validateCreateStudyLevelDegreeClass,
  validateCreateStudyLevelDegreeClassAllocation,
};
