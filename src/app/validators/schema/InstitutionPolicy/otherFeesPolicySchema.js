const Joi = require('joi');

const createOtherFeesPolicySchema = Joi.object({
  other_fees_element_id: Joi.number().required(),
  course_unit_status_id: Joi.number().required(),
});

const updateOtherFeesPolicySchema = Joi.object({
  other_fees_element_id: Joi.number(),
  course_unit_status_id: Joi.number(),
});

module.exports = {
  createOtherFeesPolicySchema,
  updateOtherFeesPolicySchema,
};
