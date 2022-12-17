const Joi = require('joi');

const createMetadataValueSchema = Joi.object({
  // metadata_id Must be a String and Forein Key in Users Table
  // metadata_id is Required
  // Trim White spcacing
  // Maximum of 50 characters
  metadata_id: Joi.number().required(),

  // metadata_value Must be a String
  // metadata_value is Required
  // Trim White spcacing
  // Maximum of 50 characters
  metadata_value: Joi.string().required().trim().max(100),

  // value_description Must be a Date field
  // value_description is Required
  metadata_value_description: Joi.string().required().max(1000),

  // created_by_id Must be a number
  // created_by_id is Required
  created_by_id: Joi.number(),

  // create_approved_by_id Must be a number
  // create_approved_by_id is Required
  create_approved_by_id: Joi.number(),

  // create_approval_date Must be a number
  // create_approval_date is Required
  create_approval_date: Joi.date(),

  // create_approval_status Must be a number
  // create_approval_status is Required
  create_approval_status: Joi.string(),
});

module.exports = createMetadataValueSchema;
