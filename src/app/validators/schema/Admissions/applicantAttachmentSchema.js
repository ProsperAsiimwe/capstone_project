const Joi = require('joi');

const createApplicantAttachmentSchema = Joi.object({
  running_admission_id: Joi.number().required(),
  section_id: Joi.number().required(),
  form_id: Joi.string(),
  attachment_name: Joi.string().required(),
  attachment: Joi.string(),
});

const updateApplicantAttachmentSchema = Joi.object({
  running_admission_id: Joi.number(),
  section_id: Joi.number(),
  form_id: Joi.string(),
  attachment_name: Joi.string().required(),
  attachment: Joi.string(),
});

module.exports = {
  createApplicantAttachmentSchema,
  updateApplicantAttachmentSchema,
};
