const Joi = require('joi');

const createFeesCopySchema = Joi.object({
  from_academic_year_id: Joi.number().required(),
  from_intake_id: Joi.number().required(),
  from_campus_id: Joi.number().required(),
  to_academic_year_id: Joi.number().required(),
  to_intake_id: Joi.number().required(),
  to_campus_id: Joi.number().required(),
  fees_types: Joi.array().items(Joi.string()).required(),
});

module.exports = { createFeesCopySchema };
