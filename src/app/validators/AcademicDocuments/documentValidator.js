const { JoiValidator } = require('@middleware');
const { documentSchema } = require('../schema/AcademicDocuments');

const validateGenerateTranscriptForm = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    documentSchema.generateTranscriptSchema
  );
};

const validateGenerateCertificateForm = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    documentSchema.generateCertificateSchema
  );
};

const validateDownloadDocumentScheme = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    documentSchema.downloadDocumentSchema
  );
};

const validateGenerateAdmissionScheme = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    documentSchema.generateAdmissionSchema
  );
};

module.exports = {
  validateGenerateTranscriptForm,
  validateGenerateCertificateForm,
  validateDownloadDocumentScheme,
  validateGenerateAdmissionScheme,
};
