const { JoiValidator } = require('@middleware');
const { applicantRefereeDetailSchema } = require('../schema/Admissions');

const validateCreateApplicantRefereeDetail = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantRefereeDetailSchema.createApplicantRefereeDetailSchema
  );
};

const validateUpdateApplicantRefereeDetail = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantRefereeDetailSchema.updateApplicantRefereeDetailSchema
  );
};

module.exports = {
  validateCreateApplicantRefereeDetail,
  validateUpdateApplicantRefereeDetail,
};
