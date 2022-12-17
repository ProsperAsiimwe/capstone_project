const Joi = require('joi');

const createRunningAdmissionProgrammeSchema = Joi.object({
  running_admission_id: Joi.number().required(),
  // Expect an array of programme foreignKeys referencing records from Programmes table.
  programmes: Joi.array().required(),
});

const updateRunningAdmissionProgrammeSchema = Joi.object({
  running_admission_id: Joi.number(),
  // Expect an array of programme foreignKeys referencing records from Programmes table.
  programmes: Joi.array().required(),
});

const manageMultipleRunningAdmissionProgrammeSchema = Joi.object({
  running_admission_programmes: Joi.array().required(),
});

module.exports = {
  createRunningAdmissionProgrammeSchema,
  updateRunningAdmissionProgrammeSchema,
  manageMultipleRunningAdmissionProgrammeSchema,
};
