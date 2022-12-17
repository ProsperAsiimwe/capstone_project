const Joi = require('joi');

const weightingCriteriaStudyTypes = Joi.object().keys({
  programme_study_type_id: Joi.number().required(),
  entry_year_id: Joi.number().required(),
  minimum_qualification_weights: Joi.number().required(),
});

const createProgrammeVersionSelectionCriteriaSchema = Joi.object({
  programme_id: Joi.number().required(),
  programme_version_id: Joi.number().required(),
  selection_criteria_code: Joi.string().required(),
  must_sit_o_level: Joi.boolean(),
  must_sit_a_level: Joi.boolean(),
  only_paid_applications: Joi.boolean(),
  studyTypes: Joi.array().items(weightingCriteriaStudyTypes).required(),
});

const updateProgrammeVersionSelectionCriteriaSchema = Joi.object({
  programme_id: Joi.number(),
  programme_version_id: Joi.number(),
  selection_criteria_code: Joi.string(),
  must_sit_o_level: Joi.boolean(),
  must_sit_a_level: Joi.boolean(),
  only_paid_applications: Joi.boolean(),
  studyTypes: Joi.array().items(weightingCriteriaStudyTypes),
});

const addWeightingCriteriaStudyTypeSchema = Joi.object({
  criteria_id: Joi.number().required(),
  programme_study_type_id: Joi.number().required(),
  entry_year_id: Joi.number().required(),
  minimum_qualification_weights: Joi.number().required(),
});

const updateWeightingCriteriaStudyTypeSchema = Joi.object({
  programme_study_type_id: Joi.number(),
  entry_year_id: Joi.number(),
  minimum_qualification_weights: Joi.number(),
});

module.exports = {
  createProgrammeVersionSelectionCriteriaSchema,
  updateProgrammeVersionSelectionCriteriaSchema,
  addWeightingCriteriaStudyTypeSchema,
  updateWeightingCriteriaStudyTypeSchema,
};
