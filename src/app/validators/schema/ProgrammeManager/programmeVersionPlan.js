const Joi = require('joi');

const createProgrammeVersionPlanSchema = Joi.object({
  // programme_version_id Must be a String
  // programme_version_id is Required
  // Trim White spcacing
  // Maximum of 100 characters
  programme_version_id: Joi.number().integer().required(),

  // programme_version_plan_id Must be a String
  // programme_version_plan_id is Required
  // Trim White spcacing
  // Maximum of 100 characters
  programme_version_plan_id: Joi.number().integer().required(),
  // Graduation load for the program - Minimum number of Credit Units to be obtained.
  graduation_load: Joi.number().required().min(1),

  // create_approval_status Must be a Date field
  // create_approval_status is Required
  create_approval_status: Joi.string().max(50),
});

module.exports = { createProgrammeVersionPlanSchema };
