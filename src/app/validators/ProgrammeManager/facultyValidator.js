const { JoiValidator } = require('@middleware');
const { facultySchema } = require('../schema/ProgrammeManager');

const validateCreateFaculty = async (req, res, next) => {
  return await JoiValidator(req, res, next, facultySchema.createFacultySchema);
};

module.exports = { validateCreateFaculty };
