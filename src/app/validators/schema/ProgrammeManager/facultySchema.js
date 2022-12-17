const Joi = require('joi');

const createFacultySchema = Joi.object({
  faculty_code: Joi.string().required().trim().max(100),
  faculty_title: Joi.string().required(),
  faculty_contact: Joi.string().required(),
  faculty_website: Joi.string(),
  faculty_address: Joi.string(),
  faculty_email: Joi.string(),
  date_established: Joi.date(),
  college_id: Joi.number(),
  headed_by_id: Joi.number(),
});

module.exports = { createFacultySchema };
