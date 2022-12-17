const Joi = require('joi');

const courseResittingPolicySchema = Joi.object({
  programme_study_level_id: Joi.number().required(),
  max_number_of_sittings: Joi.number().required(),
});

const studyLevelPassMarkPolicySchema = Joi.object({
  programme_study_level_id: Joi.number().required(),
  pass_mark: Joi.number().optional().allow(null).positive(),
  all_entry_academic_years: Joi.boolean().required(),
  academic_years: Joi.array()
    .items(
      Joi.object({
        academic_year_id: Joi.number().required(),
        pass_mark: Joi.number().required(),
      })
    )
    .optional()
    .allow(null),
});

const studyLevelDegreeClassAllocations = Joi.object().keys({
  name: Joi.string().required(),
  range_from: Joi.number().required(),
  range_to: Joi.number().required(),
});

const studyLevelDegreeClassSchema = Joi.object({
  programme_study_level_id: Joi.number().required(),
  degree_class_allocations: Joi.array()
    .items(studyLevelDegreeClassAllocations)
    .required(),
});

const studyLevelDegreeClassAllocationSchema = Joi.object({
  name: Joi.string().required(),
  range_from: Joi.number().required(),
  range_to: Joi.number().required(),
});

module.exports = {
  courseResittingPolicySchema,
  studyLevelPassMarkPolicySchema,
  studyLevelDegreeClassSchema,
  studyLevelDegreeClassAllocationSchema,
};
