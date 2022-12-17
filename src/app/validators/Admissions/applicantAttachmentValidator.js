const { JoiValidator } = require('@middleware');
const { applicantAttachmentSchema } = require('../schema/Admissions');

const validateCreateApplicantAttachment = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantAttachmentSchema.createApplicantAttachmentSchema
  );
};

const validateUpdateApplicantAttachment = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    applicantAttachmentSchema.updateApplicantAttachmentSchema
  );
};

module.exports = {
  validateCreateApplicantAttachment,
  validateUpdateApplicantAttachment,
};
