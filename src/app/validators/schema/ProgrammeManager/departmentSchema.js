const Joi = require('joi');

const createDepartmentSchema = Joi.object({
  department_code: Joi.string().required().trim().max(100),
  department_title: Joi.string().required(),
  department_contact: Joi.string().required(),
  department_website: Joi.string(),
  department_address: Joi.string(),
  department_email: Joi.string(),
  date_established: Joi.date(),
  headed_by_id: Joi.number(),
  faculty_id: Joi.number(),
});

module.exports = { createDepartmentSchema };
