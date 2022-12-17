const { JoiValidator } = require('@middleware');
const { collegeSchema } = require('../schema/ProgrammeManager');

const validateCreateCollege = async (req, res, next) => {
  return await JoiValidator(req, res, next, collegeSchema.createCollegeSchema);
};

module.exports = { validateCreateCollege };
