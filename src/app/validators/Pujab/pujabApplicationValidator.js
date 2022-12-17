const { JoiValidator } = require('@middleware');
const { pujabApplicationSchema } = require('@validators/schema/Pujab');

const validateBioData = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    pujabApplicationSchema.bioDataSchema
  );
};

const validateParent = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    pujabApplicationSchema.parentSchema
  );
};

const validateResult = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    pujabApplicationSchema.resultSchema
  );
};

const validatePreviousAdmission = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    pujabApplicationSchema.previousAdmissionSchema
  );
};

const validateDisability = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    pujabApplicationSchema.disabilitySchema
  );
};

const validateProgrammeChoice = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    pujabApplicationSchema.programmeChoiceSchema
  );
};
const validatePaymentTransferSchema = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    pujabApplicationSchema.paymentTransferSchema
  );
};

module.exports = {
  validateBioData,
  validateParent,
  validateResult,
  validatePreviousAdmission,
  validateDisability,
  validateProgrammeChoice,
  validatePaymentTransferSchema,
};
