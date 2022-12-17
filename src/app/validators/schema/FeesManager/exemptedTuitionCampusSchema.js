const Joi = require('joi');

const createExemptedTuitionSchema = Joi.object({
  campuses: Joi.array().items(Joi.number()).required(),
});

module.exports = { createExemptedTuitionSchema };
