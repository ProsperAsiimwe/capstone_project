const { JoiValidator } = require('@middleware');
const { studentServicePolicySchema } = require('../schema/InstitutionPolicy');

const validateCreateStudentServicePolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    studentServicePolicySchema.createStudentServicePolicySchema
  );
};
const validateUpdateStudentServicePolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    studentServicePolicySchema.updateStudentServicePolicySchema
  );
};

module.exports = {
  validateCreateStudentServicePolicy,
  validateUpdateStudentServicePolicy,
};
