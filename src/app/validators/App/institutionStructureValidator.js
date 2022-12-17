const { JoiValidator } = require('@middleware');
const { institutionStructureSchema } = require('../schema/App');

const validateCreateInstitutionStructure = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    institutionStructureSchema.createInstitutionStructureSchema
  );
};

const validateUpdateInstitutionStructure = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    institutionStructureSchema.updateInstitutionStructureSchema
  );
};

module.exports = {
  validateCreateInstitutionStructure,
  validateUpdateInstitutionStructure,
};
