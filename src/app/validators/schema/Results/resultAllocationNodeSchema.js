const Joi = require('joi');

const createNodeSchema = Joi.object({
  node_lecturer_id: Joi.number().required(),
  parent_node_id: Joi.number().required(),
  marks_computation_method_id: Joi.number(),
  node_name: Joi.string().required(),
  percentage_contribution: Joi.number().required(),
});

const downloadNodeMarksTemplateSchema = Joi.object({
  node_id: Joi.number().required(),
  course_unit_id: Joi.number().required(),
  academic_year_id: Joi.number().required(),
  semester_id: Joi.number().required(),
  intake_id: Joi.number().required(),
  campus_id: Joi.number().required(),
  programme_type_id: Joi.number().required(),
  programme_version_id: Joi.number().required(),
});

module.exports = {
  createNodeSchema,
  downloadNodeMarksTemplateSchema,
};
