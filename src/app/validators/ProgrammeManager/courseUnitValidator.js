const { JoiValidator } = require('@middleware');
const { courseUnitSchema } = require('../schema/ProgrammeManager');

const validateCreateCourseUnit = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    courseUnitSchema.createCourseUnitSchema
  );
};

const validateUpdateCourseUnit = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    courseUnitSchema.updateCourseUnitSchema
  );
};

const validateUploadCourseUnit = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    courseUnitSchema.uploadCourseUnitSchema
  );
};

const validateCourseUnitToPlan = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    courseUnitSchema.addCourseUnitToPlanSchema
  );
};

const validateCourseUnitToSpecialization = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    courseUnitSchema.addCourseUnitToSpecializationSchema
  );
};

const validateCourseUnitToSubject = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    courseUnitSchema.addCourseUnitToSubjectSchema
  );
};

module.exports = {
  validateCreateCourseUnit,
  validateUpdateCourseUnit,
  validateUploadCourseUnit,
  validateCourseUnitToPlan,
  validateCourseUnitToSpecialization,
  validateCourseUnitToSubject,
};
