const { JoiValidator } = require('@middleware');
const { NTCSubjectsSchema } = require('@validators/schema/NTCMgt');

const validateCreateNTCSubject = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    NTCSubjectsSchema.createNTCSubjectSchema
  );
};

module.exports = { validateCreateNTCSubject };
