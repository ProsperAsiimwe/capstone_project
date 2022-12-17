const Joi = require('joi');

const generateTranscriptSchema = Joi.object({
  studentNumbers: Joi.array().required(),
  entryType: Joi.string().optional(),
  remark: Joi.string().optional().allow(''),
});

const generateCertificateSchema = Joi.object({
  studentNumbers: Joi.array().required(),
});

const downloadDocumentSchema = Joi.object({
  studentNumbers: Joi.array().required(),
});

const generateAdmissionSchema = Joi.object({
  academic_year_id: Joi.number().min(1).required(),
  intake_id: Joi.number().min(1).required(),
  degree_category_id: Joi.number().min(1).required(),
  admission_scheme_id: Joi.number().min(1).required(),
  programme_id: Joi.number().min(1).required(),
  documentType: Joi.string().allow('all', 'provisional', 'original'),
  applicants: Joi.array().empty(),
  reportDate: Joi.date(),
  regDeadline: Joi.date(),
});

module.exports = {
  generateTranscriptSchema,
  generateCertificateSchema,
  downloadDocumentSchema,
  generateAdmissionSchema,
};
