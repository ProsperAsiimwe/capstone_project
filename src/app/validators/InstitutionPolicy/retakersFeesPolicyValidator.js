const { JoiValidator } = require('@middleware');
const { retakersFeesPolicySchema } = require('../schema/InstitutionPolicy');

const validateCreateRetakersFeesPolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    retakersFeesPolicySchema.createRetakersFeesPolicySchema
  );
};

const validateUpdateRetakersFeesPolicy = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    retakersFeesPolicySchema.updateRetakersFeesPolicySchema
  );
};

const validateAddNewRetakersFeesPolicyElements = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    retakersFeesPolicySchema.addNewRetakersFeesPolicyElementsSchema
  );
};

const validateDeleteRetakersFeesPolicyElements = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    retakersFeesPolicySchema.deleteRetakersFeesPolicyElementsSchema
  );
};

module.exports = {
  validateCreateRetakersFeesPolicy,
  validateUpdateRetakersFeesPolicy,
  validateAddNewRetakersFeesPolicyElements,
  validateDeleteRetakersFeesPolicyElements,
};
