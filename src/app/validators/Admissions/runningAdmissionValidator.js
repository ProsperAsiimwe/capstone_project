const { JoiValidator } = require('@middleware');
const { runningAdmissionSchema } = require('../schema/Admissions');

const validateCreateRunningAdmission = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    runningAdmissionSchema.createRunningAdmissionSchema
  );
};

const validateUpdateRunningAdmission = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    runningAdmissionSchema.updateRunningAdmissionSchema
  );
};

const validateDownloadReport = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    runningAdmissionSchema.downloadReportSchema
  );
};

const administrativelyAdmitValidator = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    runningAdmissionSchema.administrativelyAdmitSchema
  );
};

module.exports = {
  validateCreateRunningAdmission,
  validateUpdateRunningAdmission,
  validateDownloadReport,
  administrativelyAdmitValidator,
};
