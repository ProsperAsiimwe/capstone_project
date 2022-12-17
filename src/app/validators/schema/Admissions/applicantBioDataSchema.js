const Joi = require('joi');

const createApplicantBioDataSchema = Joi.object({
  running_admission_id: Joi.number().required(),
  section_id: Joi.number().required(),
  form_id: Joi.string(),
  salutation_id: Joi.number().required(),
  surname: Joi.string().required(),
  other_names: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().required(),
  date_of_birth: Joi.date().required(),
  birth_certificate_attachment: Joi.string(),
  district_of_origin: Joi.string().required(),
  gender: Joi.string().required(),
  religion: Joi.string().required(),
  marital_status: Joi.string().required(),
  nationality: Joi.string().required(),
  national_id_number: Joi.string(),
  national_id_attachment: Joi.string(),
  passport_id_number: Joi.string(),
  passport_attachment: Joi.string(),
  emis_id_number: Joi.string(),
  place_of_residence: Joi.string().required(),
  district_of_birth: Joi.string().required(),
  disability_details: Joi.string(),
});

const updateApplicantBioDataSchema = Joi.object({
  running_admission_id: Joi.number(),
  salutation_id: Joi.number(),
  form_id: Joi.string(),
  surname: Joi.string(),
  other_names: Joi.string(),
  phone: Joi.string(),
  email: Joi.string(),
  date_of_birth: Joi.date(),
  birth_certificate_attachment: Joi.string(),
  district_of_origin: Joi.string(),
  gender: Joi.string(),
  religion: Joi.string(),
  marital_status: Joi.string(),
  nationality: Joi.string(),
  national_id_number: Joi.string(),
  national_id_attachment: Joi.string(),
  passport_id_number: Joi.string(),
  passport_attachment: Joi.string(),
  emis_id_number: Joi.string(),
  place_of_residence: Joi.string(),
  district_of_birth: Joi.string(),
  disability_details: Joi.string(),
});

const updateApplicantBioDataByStaffSchema = Joi.object({
  surname: Joi.string().required(),
  other_names: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().required(),
  gender: Joi.string(),
});

module.exports = {
  createApplicantBioDataSchema,
  updateApplicantBioDataSchema,
  updateApplicantBioDataByStaffSchema,
};
