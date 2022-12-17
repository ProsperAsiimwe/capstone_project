const { JoiValidator } = require('@middleware');
const { admissionFormSchema } = require('../schema/Admissions');

const validateCreateAdmissionForm = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    admissionFormSchema.createAdmissionFormSchema
  );
};

const validateUpdateAdmissionForm = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    admissionFormSchema.updateAdmissionFormSchema
  );
};

module.exports = {
  validateCreateAdmissionForm,
  validateUpdateAdmissionForm,
};
