const Joi = require('joi');

const createProgrammeVersionPlanAdmissionCriteriaSchema = Joi.object({
  programme_version_plan_id: Joi.number().required(),
  study_level_id: Joi.number().required(),
  criteria_category_id: Joi.number().required(),
  criteria_condition_id: Joi.number().required(),

  // This is an array of uneb subjects from uneb subjects table.
  uneb_subjects: Joi.array().required(),
});

const updateProgrammeVersionPlanAdmissionCriteriaSchema = Joi.object({
  programme_version_plan_id: Joi.number(),
  study_level_id: Joi.number(),
  criteria_category_id: Joi.number(),
  criteria_condition_id: Joi.number(),

  // This is an array of uneb subjects from uneb subjects table.
  uneb_subjects: Joi.array(),
});

module.exports = {
  createProgrammeVersionPlanAdmissionCriteriaSchema,
  updateProgrammeVersionPlanAdmissionCriteriaSchema,
};
