const Joi = require('joi');

const getApplicantResultSchema = Joi.object({
  examYear: Joi.number().required(),
  indexNumber: Joi.string().required(),
});

module.exports = {
  getApplicantResultSchema,
};
