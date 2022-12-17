const { JoiValidator } = require('@middleware');
const { pujabSchema } = require('@validators/schema/Pujab');

const validateCreateApplicant = async (req, res, next) => {
  return await JoiValidator(req, res, next, pujabSchema.applicantSchema);
};

const validateCreateInstitution = async (req, res, next) => {
  return await JoiValidator(req, res, next, pujabSchema.institutionSchema);
};

const validateCreateProgramme = async (req, res, next) => {
  return await JoiValidator(req, res, next, pujabSchema.programmeSchema);
};

module.exports = {
  validateCreateApplicant,
  validateCreateInstitution,
  validateCreateProgramme,
};
