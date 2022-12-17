const Joi = require('joi');

const billingCategoryAmounts = Joi.object().keys({
  billing_category_id: Joi.number().required(),
  currency_id: Joi.number().required(),
  amount: Joi.number().required(),
});

const specialFees = Joi.object().keys({
  account_id: Joi.number().required(),
  special_fee_name: Joi.string().required(),
  amounts: Joi.array().items(billingCategoryAmounts).required(),
});

// Define the running admission programme campus programme types object's format expected
const campusProgrammeTypes = Joi.object().keys({
  running_admission_programme_id: Joi.number().required(),
  programme_alias_id: Joi.number(),
  campus_id: Joi.number().required(),
  programme_type_id: Joi.number().required(),
  capacity: Joi.number().required(),
  entry_study_years: Joi.array().items(Joi.number()).required(),
  sponsorships: Joi.array().items(Joi.number()).required(),
  subject_combinations: Joi.array().items(Joi.number()),
});

const createRunningAdmissionProgrammeCampusSchema = Joi.object({
  running_admission_programme_id: Joi.number().required(),
  special_fees: Joi.array().items(specialFees),
  special_remarks_and_requirements: Joi.string().empty('').allow(null),
  // This is an array of campus-programme-types
  programmeCampusContext: Joi.array().items(campusProgrammeTypes).required(),
});

const createSingleCapacitySettingSchema = Joi.object({
  running_admission_programme_id: Joi.number().required(),
  programme_alias_id: Joi.number(),
  campus_id: Joi.number().required(),
  programme_type_id: Joi.number().required(),
  capacity: Joi.number().required(),
  entry_study_years: Joi.array().items(Joi.number()).required(),
  sponsorships: Joi.array().items(Joi.number()).required(),
  subject_combinations: Joi.array().items(Joi.number()),
});

const updateRunningAdmissionProgrammeCampusSchema = Joi.object({
  // This is an array of campus-programme-types
  running_admission_programme_id: Joi.number().required(),
  programme_alias_id: Joi.number(),
  campus_id: Joi.number().required(),
  programme_type_id: Joi.number().required(),
  capacity: Joi.number().required(),
  entry_study_years: Joi.array().items(Joi.number()),
  sponsorships: Joi.array().items(Joi.number()),
  subject_combinations: Joi.array().items(Joi.number()),
});

const updateRunningAdmissionProgrammeSpecialRemarks = Joi.object({
  special_remarks_and_requirements: Joi.string().required(),
});

const createRunningAdmissionProgrammeSpecialFeesSchema = Joi.object({
  running_admission_programme_id: Joi.number().required(),
  account_id: Joi.number().required(),
  special_fee_name: Joi.string().required(),
  amounts: Joi.array().items(billingCategoryAmounts).required(),
});

const updateRunningAdmissionProgrammeSpecialFees = Joi.object({
  account_id: Joi.number(),
  special_fee_name: Joi.string(),
  amounts: Joi.array().items(billingCategoryAmounts),
});

module.exports = {
  createRunningAdmissionProgrammeSpecialFeesSchema,
  createSingleCapacitySettingSchema,
  createRunningAdmissionProgrammeCampusSchema,
  updateRunningAdmissionProgrammeCampusSchema,
  updateRunningAdmissionProgrammeSpecialRemarks,
  updateRunningAdmissionProgrammeSpecialFees,
};
