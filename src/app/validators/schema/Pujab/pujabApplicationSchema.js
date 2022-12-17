const Joi = require('joi');

const bioDataSchema = Joi.object({
  section: Joi.string().required(),
  pujab_running_admission_id: Joi.string().required(),
  surname: Joi.string().required(),
  other_names: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().email().required(),
  date_of_birth: Joi.date().required(),
  gender: Joi.string().required(),
  marital_status: Joi.string().required(),
  religion: Joi.string().allow('').allow(null),
  fax_no: Joi.string().allow('').allow(null),
  permanent_address: Joi.string().required(),
  emergency_contact_address: Joi.string().allow('').allow(null),
  citizenship: Joi.string().required(),
  home_district: Joi.string().required(),
  county: Joi.string().required(),
  sub_county: Joi.string().required(),
  parish: Joi.string().required(),
  village: Joi.string().required(),
});

const parent = {
  surname: Joi.string().required(),
  other_names: Joi.string().required(),
  telephone_number: Joi.string().allow('').allow(null),
  address: Joi.string().required(),
  country_of_residence: Joi.string().required(),
  nationality: Joi.string().required(),
  citizenship: Joi.string().required(),
  district_of_birth: Joi.string().required(),
  sub_county: Joi.string().required(),
  village_of_birth: Joi.string().required(),
  date_of_birth: Joi.date().required(),
  relationship: Joi.string().required(),
};

const parentSchema = Joi.object({
  pujab_running_admission_id: Joi.number().required(),
  section: Joi.string().required(),
  fatherInfo: Joi.object(parent).required(),
  motherInfo: Joi.object(parent).required(),
});

const paymentTransferSchema = Joi.object({
  current_prn: Joi.number().required(),
  payment_prn: Joi.number().required(),
});

const programmeChoiceSchema = Joi.object({
  pujab_running_admission_id: Joi.number().required(),
  section: Joi.string().required(),
  programmeChoices: Joi.array()
    .items(
      Joi.object({
        programme_context_id: Joi.number().required(),
        pujab_section_id: Joi.number().required(),
        choice_number: Joi.number().required(),
        choice_number_name: Joi.string().required(),
      })
    )
    .required(),
});

const previousAdmissionSchema = Joi.object({
  pujab_running_admission_id: Joi.number().required(),
  section: Joi.string().required(),
  has_previous_admission: Joi.boolean().required(),
  programme: Joi.alternatives().conditional('has_previous_admission', {
    is: true,
    then: Joi.string().required().max(200),
  }),
  registration_number: Joi.alternatives().conditional(
    'has_previous_admission',
    {
      is: true,
      then: Joi.string().required().max(25),
    }
  ),
  sponsor: Joi.alternatives().conditional('has_previous_admission', {
    is: true,
    then: Joi.string().allow('').allow(null),
  }),
  student_number: Joi.alternatives().conditional('has_previous_admission', {
    is: true,
    then: Joi.string().required().max(20),
  }),
  institution_name: Joi.alternatives().conditional('has_previous_admission', {
    is: true,
    then: Joi.string().required().max(100),
  }),
});

const disabilitySchema = Joi.object({
  pujab_running_admission_id: Joi.number().required(),
  section: Joi.string().required(),
  has_disability: Joi.boolean().required(),
  disability_details: Joi.alternatives().conditional('has_disability', {
    is: true,
    then: Joi.string().allow('').allow(null),
  }),
});

const resultSchema = Joi.object({
  pujab_running_admission_id: Joi.number().required(),
  has_results: Joi.boolean().required(),
  section: Joi.string().required(),
  school_name: Joi.alternatives().conditional('has_results', {
    is: true,
    then: Joi.string().required(),
  }),
  exam_year: Joi.alternatives().conditional('has_results', {
    is: true,
    then: Joi.number().required().min(2000),
  }),
  index_number: Joi.alternatives().conditional('has_results', {
    is: true,
    then: Joi.string().required().max(15).min(5),
  }),
  subjects: Joi.alternatives().conditional('has_results', {
    is: true,
    then: Joi.array()
      .items(
        Joi.object({
          subject: Joi.string().required().max(100),
          grade: Joi.string().required().min(1).max(3),
        })
      )
      .required(),
  }),
});

module.exports = {
  bioDataSchema,
  parentSchema,
  resultSchema,
  previousAdmissionSchema,
  disabilitySchema,
  programmeChoiceSchema,
  paymentTransferSchema,
};
