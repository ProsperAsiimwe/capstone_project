const Joi = require('joi');

const programmes = Joi.object().keys({
  institution_programme_id: Joi.number().required(),
  pujab_section_id: Joi.number().required(),
});

const admissionSchema = Joi.object({
  academic_year_id: Joi.number().required(),
  currency_id: Joi.number().required(),
  application_fee: Joi.number().required(),
  service_fee: Joi.number().allow(null),
  admission_start_date: Joi.date().required(),
  admission_end_date: Joi.date().required(),
  institutions: Joi.array().items(Joi.number()).required(),
  chart_of_account_id: Joi.number().required(),
  instructions: Joi.string(),
});

const admissionInstitutionProgrammeSchema = Joi.object({
  pujab_admission_institution_id: Joi.number().required(),
  programmes: Joi.array().items(programmes).required(),
});

const deletePujabAdmissionInstitutionProgrammesSchema = Joi.object({
  programmes: Joi.array().items(Joi.number()).required(),
});

const updateApplicantsByFirstChoiceSchema = Joi.object({
  first_choice_prog: Joi.string(),
});

const updateProposedMeritAdmissionSchema = Joi.object({
  admitted_programme_code: Joi.string(),
  admitted_programme_title: Joi.string(),
  final_weight: Joi.number(),
});

module.exports = {
  admissionSchema,
  admissionInstitutionProgrammeSchema,
  deletePujabAdmissionInstitutionProgrammesSchema,
  updateApplicantsByFirstChoiceSchema,
  updateProposedMeritAdmissionSchema,
};
