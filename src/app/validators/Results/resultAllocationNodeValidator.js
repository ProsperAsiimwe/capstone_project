const { JoiValidator } = require('@middleware');
const { resultAllocationNodeSchema } = require('../schema/Results');

const validateCreateNode = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    resultAllocationNodeSchema.createNodeSchema
  );
};
const validateNodeMarksTemplate = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    resultAllocationNodeSchema.downloadNodeMarksTemplateSchema
  );
};

module.exports = {
  validateCreateNode,
  validateNodeMarksTemplate,
};
