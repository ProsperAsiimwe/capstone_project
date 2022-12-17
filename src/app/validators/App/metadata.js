const { JoiValidator } = require('@middleware');
const { metadataValueSchema, metadataSchema } = require('../schema/App');

const validateCreateMetadata = async (req, res, next) => {
  return await JoiValidator(req, res, next, metadataSchema);
};

const validateCreateMetadataValue = async (req, res, next) => {
  return await JoiValidator(req, res, next, metadataValueSchema);
};

module.exports = {
  validateCreateMetadata,
  validateCreateMetadataValue,
};
