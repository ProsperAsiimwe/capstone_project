const Joi = require('joi');

// Define the form section object's format expected
const AdmissionFormSections = Joi.object().keys({
  form_section_id: Joi.number().required(),
  section_number: Joi.number().required(),
  is_mandatory: Joi.boolean().required(),
});

const createAdmissionFormSchema = Joi.object({
  form_name: Joi.string().required(),
  form_description: Joi.string().required(),
  // This is an array of form sections from metadata values.
  sections: Joi.array().items(AdmissionFormSections).required(),
});

const updateAdmissionFormSchema = Joi.object({
  form_name: Joi.string(),
  form_description: Joi.string(),
  // This is an array of form sections from metadata values.
  sections: Joi.array().items(AdmissionFormSections),
});

module.exports = { createAdmissionFormSchema, updateAdmissionFormSchema };
