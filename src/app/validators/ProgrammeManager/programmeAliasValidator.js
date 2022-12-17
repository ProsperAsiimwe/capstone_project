const { JoiValidator } = require('@middleware');
const { programmeAliasSchema } = require('../schema/ProgrammeManager');

const validateCreateProgrammeAlias = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    programmeAliasSchema.createProgrammeAliasSchema
  );
};

const validateUpdateProgrammeAlias = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    programmeAliasSchema.updateProgrammeAliasSchema
  );
};

module.exports = { validateCreateProgrammeAlias, validateUpdateProgrammeAlias };
