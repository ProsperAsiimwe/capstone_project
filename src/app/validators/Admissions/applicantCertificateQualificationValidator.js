const { JoiValidator } = require('@middleware');
const {
  applicantCertificateQualificationSchema,
} = require('../schema/Admissions');

const validateCreateApplicantCertificateQualification = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantCertificateQualificationSchema.createApplicantCertificateQualificationSchema
  );
};

const validateUpdateApplicantCertificateQualification = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantCertificateQualificationSchema.updateApplicantCertificateQualificationSchema
  );
};

module.exports = {
  validateCreateApplicantCertificateQualification,
  validateUpdateApplicantCertificateQualification,
};
