const Joi = require('joi');

const createRunningAdmissionSchema = Joi.object({
  academic_year_id: Joi.number().required(),
  intake_id: Joi.number().required(),
  admission_scheme_id: Joi.number().required(),
  admission_form_id: Joi.number().required(),
  degree_category_id: Joi.number().required(),
  application_fees_policy_id: Joi.number().required(),
  admission_fees_policy_id: Joi.number(),
  number_of_choices: Joi.number().required(),
  maximum_number_of_forms: Joi.number().required(),
  activate_online_applications: Joi.boolean(),
  activate_admission_fees: Joi.boolean(),
  admission_start_date: Joi.date(),
  admission_end_date: Joi.date(),
  admission_description: Joi.string(),
  instructions: Joi.string(),
  o_level_year_from: Joi.number(),
  o_level_year_to: Joi.number(),
  a_level_year_from: Joi.number(),
  a_level_year_to: Joi.number(),
});

const updateRunningAdmissionSchema = Joi.object({
  academic_year_id: Joi.number(),
  intake_id: Joi.number(),
  admission_scheme_id: Joi.number(),
  admission_form_id: Joi.number(),
  degree_category_id: Joi.number(),
  application_fees_policy_id: Joi.number(),
  admission_fees_policy_id: Joi.number(),
  number_of_choices: Joi.number(),
  maximum_number_of_forms: Joi.number(),
  activate_online_applications: Joi.boolean(),
  activate_admission_fees: Joi.boolean(),
  admission_start_date: Joi.date(),
  admission_end_date: Joi.date(),
  admission_description: Joi.string(),
  instructions: Joi.string(),
});

const downloadReportSchema = Joi.object({
  academic_year_id: Joi.number().min(1).required(),
  admission_scheme_id: Joi.number().min(1).required(),
  intake_id: Joi.number().min(1).required(),
  degree_category_id: Joi.number().min(1).required(),
  category: Joi.string().allow('all', 'paid', 'unpaid').required(),
});

const administrativelyAdmitSchema = Joi.object({
  applicant_programme_choices: Joi.array().items(Joi.number()).required(),
});

module.exports = {
  createRunningAdmissionSchema,
  updateRunningAdmissionSchema,
  downloadReportSchema,
  administrativelyAdmitSchema,
};
