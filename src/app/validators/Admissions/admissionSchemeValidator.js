const { JoiValidator } = require('@middleware');
const { admissionSchemeSchema } = require('../schema/Admissions');

const validateCreateAdmissionScheme = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    admissionSchemeSchema.createAdmissionSchemeSchema
  );
};

const validateUpdateAdmissionScheme = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    admissionSchemeSchema.updateAdmissionSchemeSchema
  );
};

module.exports = {
  validateCreateAdmissionScheme,
  validateUpdateAdmissionScheme,
};
