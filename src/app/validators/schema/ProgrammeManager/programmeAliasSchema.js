const Joi = require('joi');
const { uniqueId } = require('lodash');

const createProgrammeAliasSchema = Joi.object({
  programme_id: Joi.number().required(),

  campus_id: Joi.number().required(),

  programme_type_id: Joi.number().required(),

  alias_code: Joi.string().required().trim().max(100),
});

const updateProgrammeAliasSchema = Joi.object({
  programme_id: Joi.number().required(),

  campus_id: Joi.number().required(),

  programme_type_id: Joi.number().required(),

  alias_code: Joi.string().required().trim().max(100),
});

module.exports = { createProgrammeAliasSchema, updateProgrammeAliasSchema };
