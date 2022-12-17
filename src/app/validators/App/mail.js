const { JoiValidator } = require('@middleware');
const {
  metadataValueSchema,
  metadataSchema,
  resendVerificationSchema,
} = require('../schema/App');

const validateCreateMetadata = async (req, res, next) => {
  return await JoiValidator(req, res, next, metadataSchema);
};

const validateCreateMetadataValue = async (req, res, next) => {
  return await JoiValidator(req, res, next, metadataValueSchema);
};

const validateResendVerificationLink = async (req, res, next) => {
  return await JoiValidator(req, res, next, resendVerificationSchema);
};

module.exports = {
  validateCreateMetadata,
  validateCreateMetadataValue,
  validateResendVerificationLink,
};
