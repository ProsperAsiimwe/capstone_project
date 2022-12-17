const { JoiValidator } = require('@middleware');
const { studentServiceSchema } = require('../schema/StudentRecords');

const validateCreateStudentService = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    studentServiceSchema.createStudentServiceSchema
  );
};

const validateApproveStudentService = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    studentServiceSchema.approveStudentServiceSchema
  );
};

const validateAcceptOrDeclineStudentService = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    studentServiceSchema.acceptOrDeclineStudentServiceSchema
  );
};

const validateEditAcademicYearService = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    studentServiceSchema.validateEditAcademicYearServiceSchema
  );
};

module.exports = {
  validateCreateStudentService,
  validateApproveStudentService,
  validateAcceptOrDeclineStudentService,
  validateEditAcademicYearService,
};
