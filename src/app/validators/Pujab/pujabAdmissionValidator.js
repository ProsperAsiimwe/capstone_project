const { JoiValidator } = require('@middleware');
const { pujabAdmissionSchema } = require('@validators/schema/Pujab');

const validateCreatePujabAdmission = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    pujabAdmissionSchema.admissionSchema
  );
};

const validateCreateAdmissionInstitutionProgramme = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    pujabAdmissionSchema.admissionInstitutionProgrammeSchema
  );
};

const validateDeletePujabAdmissionInstitutionProgrammes = async (
  req,
  res,
  next
) => {
  return await JoiValidator(
    req,
    res,
    next,
    pujabAdmissionSchema.deletePujabAdmissionInstitutionProgrammesSchema
  );
};

const validateUpdateApplicantsByFirstChoice = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    pujabAdmissionSchema.updateApplicantsByFirstChoiceSchema
  );
};

const validateUpdateProposedMeritAdmission = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    pujabAdmissionSchema.updateProposedMeritAdmissionSchema
  );
};

module.exports = {
  validateCreatePujabAdmission,
  validateCreateAdmissionInstitutionProgramme,
  validateDeletePujabAdmissionInstitutionProgrammes,
  validateUpdateApplicantsByFirstChoice,
  validateUpdateProposedMeritAdmission,
};
