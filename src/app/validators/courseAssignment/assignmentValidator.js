const { JoiValidator } = require('@middleware');
const { assignmentSchema } = require('../schema/CourseAssignment');

const validateCreateCourseAssignment = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    assignmentSchema.courseAssignmentSchema
  );
};

const updateCourseAssignmentSchema = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    assignmentSchema.updateCourseAssignmentSchema
  );
};

const validateAddCourseUnits = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    assignmentSchema.addCourseUnitsSchema
  );
};

const validateAddCourseUnitGroups = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    assignmentSchema.addCourseUnitGroupsSchema
  );
};

const validateAddCourseUnitLecturers = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    assignmentSchema.addCourseUnitLecturersSchema
  );
};

const validateUpdateCourseUnits = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    assignmentSchema.updateCourseUnitsSchema
  );
};

const validateUpdateCourseUnitGroups = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    assignmentSchema.updateCourseUnitGroupsSchema
  );
};

const validateUpdateCourseUnitLecturers = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    assignmentSchema.updateCourseUnitLecturersSchema
  );
};

module.exports = {
  validateCreateCourseAssignment,
  updateCourseAssignmentSchema,
  validateAddCourseUnits,
  validateAddCourseUnitGroups,
  validateUpdateCourseUnits,
  validateUpdateCourseUnitGroups,
  validateAddCourseUnitLecturers,
  validateUpdateCourseUnitLecturers,
};
