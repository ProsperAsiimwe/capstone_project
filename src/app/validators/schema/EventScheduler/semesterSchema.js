const Joi = require('joi');

const createSemesterSchema = Joi.object({
  semester_id: Joi.number().required(),

  academic_year_id: Joi.number().required(),

  start_date: Joi.date().required(),

  end_date: Joi.date().required(),
});

const updateSemesterSchema = Joi.object({
  semester_id: Joi.number(),

  academic_year_id: Joi.number(),

  start_date: Joi.date(),

  end_date: Joi.date(),

  semester_campuses: Joi.array(),

  semester_intakes: Joi.array(),

  semester_entry_academic_years: Joi.array(),
});

module.exports = { updateSemesterSchema, createSemesterSchema };
