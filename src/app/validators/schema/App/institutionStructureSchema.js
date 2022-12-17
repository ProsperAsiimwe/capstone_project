const Joi = require('joi');

const createInstitutionStructureSchema = Joi.object({
  institution_name: Joi.string().required(),
  institution_address: Joi.string().required(),
  institution_slogan: Joi.string().required(),
  institution_website: Joi.string().required(),
  institution_logo: Joi.any(),
  institution_email: Joi.string().required(),
  telephone_1: Joi.string().required(),
  telephone_2: Joi.string(),
  academic_units: Joi.any().required(),
});

const updateInstitutionStructureSchema = Joi.object({
  institution_name: Joi.string().required(),
  institution_address: Joi.string().required(),
  institution_slogan: Joi.string().required(),
  institution_website: Joi.string().required(),
  institution_logo: Joi.any(),
  institution_email: Joi.string().required(),
  telephone_1: Joi.string().required(),
  telephone_2: Joi.string(),
  academic_units: Joi.any().required(),
});

module.exports = {
  createInstitutionStructureSchema,
  updateInstitutionStructureSchema,
};
