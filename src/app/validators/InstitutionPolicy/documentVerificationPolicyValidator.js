const { JoiValidator } = require('@middleware');
const {
  documentVerificationPolicySchema,
} = require('../schema/InstitutionPolicy');

const validateCreateDocumentVerificationPolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    documentVerificationPolicySchema.createDocumentVerificationPolicySchema
  );
};

const validateUpdateDocumentVerificationPolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    documentVerificationPolicySchema.updateDocumentVerificationPolicySchema
  );
};

module.exports = {
  validateCreateDocumentVerificationPolicy,
  validateUpdateDocumentVerificationPolicy,
};
