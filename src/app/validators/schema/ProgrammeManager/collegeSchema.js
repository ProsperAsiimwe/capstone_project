const Joi = require('joi');

const createCollegeSchema = Joi.object({
  college_code: Joi.string().required().trim().max(100),
  college_title: Joi.string().required().trim(),
  college_contact: Joi.string().required(),
  college_website: Joi.string(),
  college_address: Joi.string(),
  college_email: Joi.string(),
  date_established: Joi.date(),
  headed_by_id: Joi.number(),
});

module.exports = { createCollegeSchema };
