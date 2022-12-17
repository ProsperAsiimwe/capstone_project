const Joi = require('joi');

const createHallAllocationPolicySchema = Joi.object({
  hall_id: Joi.number().required(),
  degree_category_id: Joi.number().required(),
  is_for_male_students: Joi.boolean(),
  is_for_female_students: Joi.boolean(),
});

const updateHallAllocationPolicySchema = Joi.object({
  hall_id: Joi.number(),
  degree_category_id: Joi.number(),
  is_for_male_students: Joi.boolean(),
  is_for_female_students: Joi.boolean(),
});

module.exports = {
  createHallAllocationPolicySchema,
  updateHallAllocationPolicySchema,
};
