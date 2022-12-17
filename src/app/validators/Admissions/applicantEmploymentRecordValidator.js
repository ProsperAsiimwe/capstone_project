const { JoiValidator } = require('@middleware');
const { applicantEmploymentRecordSchema } = require('../schema/Admissions');

const validateCreateApplicantEmploymentRecord = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantEmploymentRecordSchema.createApplicantEmploymentRecordSchema
  );
};

const validateUpdateApplicantEmploymentRecord = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantEmploymentRecordSchema.updateApplicantEmploymentRecordSchema
  );
};

module.exports = {
  validateCreateApplicantEmploymentRecord,
  validateUpdateApplicantEmploymentRecord,
};
