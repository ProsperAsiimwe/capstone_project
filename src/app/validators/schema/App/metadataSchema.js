const Joi = require('joi');

const createMetadataSchema = Joi.object({
  // metadata_name Must be a String
  // metadata_name is Required
  // Trim White spcacing
  // Maximum of 50 characters
  metadata_name: Joi.string().required().trim().max(50),

  // metadata_description Must be a Date field
  // metadata_description is Required
  metadata_description: Joi.string().required().max(200),

  // created_by_id Must be a number and Forein Key in Users Table
  // created_by_id is Required
  created_by_id: Joi.number(),

  // create_approved_by_id Must be a number and Forein Key in Users Table
  // create_approved_by_id is Required
  create_approved_by_id: Joi.number(),

  // create_approval_date Must be a number
  // create_approval_date is Required
  create_approval_date: Joi.date(),

  // create_approval_status Must be a number and Forein Key in Users Table
  // create_approval_status is Required
  create_approval_status: Joi.string(),
});

module.exports = createMetadataSchema;
