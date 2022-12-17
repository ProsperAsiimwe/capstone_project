const Joi = require('joi');

const unebSubjects = Joi.object().keys({
  uneb_subject_id: Joi.number().required(),
  minimum_grade: Joi.string().required(),
});

const weightingCriteriaCategories = Joi.object().keys({
  uneb_study_level_id: Joi.number().required(),
  weighting_category_id: Joi.number().allow(null),
  weighting_condition_id: Joi.number().required(),
  unebSubjects: Joi.array().items(unebSubjects),
});

const createProgrammeVersionWeightingCriteriaSchema = Joi.object({
  programme_id: Joi.number().required(),
  programme_version_id: Joi.number().required(),
  weighting_criteria_code: Joi.string().required(),
  weigh_o_level: Joi.boolean().required(),
  weigh_a_level: Joi.boolean().required(),
  extra_female_points: Joi.number(),
  extra_male_points: Joi.number(),
  categories: Joi.array().items(weightingCriteriaCategories).required(),
});

const updateProgrammeVersionWeightingCriteriaSchema = Joi.object({
  programme_id: Joi.number(),
  programme_version_id: Joi.number(),
  weighting_criteria_code: Joi.string(),
  weigh_o_level: Joi.boolean(),
  weigh_a_level: Joi.boolean(),
  extra_female_points: Joi.number(),
  extra_male_points: Joi.number(),
});

const addWeightingCriteriaCategorySubjectsSchema = Joi.object({
  criteria_category_id: Joi.number().required(),
  unebSubjects: Joi.array().items(unebSubjects).required(),
});

const addWeightingCriteriaCategorySchema = Joi.object({
  criteria_id: Joi.number().required(),
  uneb_study_level_id: Joi.number().required(),
  weighting_category_id: Joi.number().allow(null),
  weighting_condition_id: Joi.number().required(),
});

const updateWeightingCriteriaCategorySchema = Joi.object({
  uneb_study_level_id: Joi.number(),
  weighting_category_id: Joi.number().allow(null),
  weighting_condition_id: Joi.number(),
  unebSubjects: Joi.array().items(unebSubjects),
});

module.exports = {
  createProgrammeVersionWeightingCriteriaSchema,
  updateProgrammeVersionWeightingCriteriaSchema,
  addWeightingCriteriaCategorySubjectsSchema,
  addWeightingCriteriaCategorySchema,
  updateWeightingCriteriaCategorySchema,
};
