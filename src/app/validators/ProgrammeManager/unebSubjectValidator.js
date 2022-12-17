const { JoiValidator } = require('@middleware');
const { unebSubjectsSchema } = require('../schema/ProgrammeManager');

const validateCreateUnebSubject = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    unebSubjectsSchema.createUnebSubjectSchema
  );
};

module.exports = { validateCreateUnebSubject };
