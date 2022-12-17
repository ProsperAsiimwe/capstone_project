const { JoiValidator } = require('@middleware');
const { departmentSchema } = require('../schema/ProgrammeManager');

const validateCreateDepartment = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    departmentSchema.createDepartmentSchema
  );
};

module.exports = { validateCreateDepartment };
