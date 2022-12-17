const Joi = require('joi');

// Define the semester object's format expected
const semesters = Joi.object().keys({
  semester_id: Joi.number().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  // Expect an array of campus foreignKeys referencing records from metadata_values.
  sem_campuses: Joi.array().required(),
  // Expect an array of intake foreignKeys referencing records from metadata_values.
  sem_intakes: Joi.array().required(),

  sem_entry_academic_years: Joi.array().required(),
});

const createAcademicYearSchema = Joi.object({
  academic_year_id: Joi.number().required(),

  start_date: Joi.date().required(),

  end_date: Joi.date().required(),

  acYr_campuses: Joi.array().items(Joi.number()).required(),

  acYr_intakes: Joi.array().items(Joi.number()).required(),

  acYr_entry_academic_years: Joi.array().items(Joi.number()).required(),

  // Expect an array of semester objects
  semesters: Joi.array().items(semesters).required(),
});

const updateAcademicYearSchema = Joi.object({
  academic_year_id: Joi.number(),

  start_date: Joi.date(),

  end_date: Joi.date(),

  academic_year_campuses: Joi.array().items(Joi.number()),

  academic_year_intakes: Joi.array().items(Joi.number()),

  academic_year_entry_academic_years: Joi.array().items(Joi.number()),
});

module.exports = { createAcademicYearSchema, updateAcademicYearSchema };
