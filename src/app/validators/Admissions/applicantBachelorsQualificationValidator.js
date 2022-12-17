const { JoiValidator } = require('@middleware');
const {
  applicantBachelorsQualificationSchema,
} = require('../schema/Admissions');

const validateCreateApplicantBachelorsQualification = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantBachelorsQualificationSchema.createApplicantBachelorsQualificationSchema
  );
};

const validateUpdateApplicantBachelorsQualification = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantBachelorsQualificationSchema.updateApplicantBachelorsQualificationSchema
  );
};

module.exports = {
  validateCreateApplicantBachelorsQualification,
  validateUpdateApplicantBachelorsQualification,
};
