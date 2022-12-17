const { JoiValidator } = require('@middleware');
const { nodeQuestionSchema } = require('../schema/Results');

const validateCreateNodeQuestion = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    nodeQuestionSchema.createNodeQuestionSchema
  );
};

module.exports = {
  validateCreateNodeQuestion,
};
