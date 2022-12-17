const { JoiValidator } = require('@middleware');
const { programmeSchema } = require('../schema/ProgrammeManager');

const validateCreateProgramme = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    programmeSchema.createProgrammeSchema
  );
};

const validateUpdateProgramme = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    programmeSchema.updateProgrammeSchema
  );
};

const validateCreateProgrammeVersionCourseUnits = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    programmeSchema.createProgrammeVersionCourseUnitsSchema
  );
};

const validateCreateProgrammeVersion = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    programmeSchema.createProgrammeVersionSchema
  );
};

const validateProgrammeVersionSubjectCombination = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    programmeSchema.createProgrammeVersionSubjectCombinationSchema
  );
};

const validateUpdateProgrammeVersionCourseUnits = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    programmeSchema.updateProgrammeVersionCourseUnitsSchema
  );
};

module.exports = {
  validateCreateProgramme,
  validateUpdateProgramme,
  validateCreateProgrammeVersionCourseUnits,
  validateUpdateProgrammeVersionCourseUnits,
  validateCreateProgrammeVersion,
  validateProgrammeVersionSubjectCombination,
};
