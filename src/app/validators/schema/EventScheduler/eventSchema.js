const Joi = require('joi');

const createEventSchema = Joi.object({
  event_id: Joi.number().required(),

  academic_year_id: Joi.number().required(),

  semester_id: Joi.number(),

  event_type: Joi.string(),

  description: Joi.string(),

  start_date: Joi.date().required(),

  end_date: Joi.date().required(),

  campuses: Joi.array().items(Joi.number()).required(),
});

const updateEventSchema = Joi.object({
  event_id: Joi.number().required(),

  academic_year_id: Joi.number().required(),

  semester_id: Joi.number(),

  event_type: Joi.string(),

  description: Joi.string(),

  start_date: Joi.date().required(),

  end_date: Joi.date().required(),

  intakes: Joi.array(),

  campuses: Joi.array(),

  entry_academic_years: Joi.array(),
});

module.exports = { createEventSchema, updateEventSchema };
