const Joi = require('joi');

const createAcademicYearFeesPolicySchema = Joi.object({
  fees_category_id: Joi.number().required(),
  enrollment_status_id: Joi.number().required(),
  bill_by_entry_academic_year: Joi.boolean().required(),
});

module.exports = {
  createAcademicYearFeesPolicySchema,
};
