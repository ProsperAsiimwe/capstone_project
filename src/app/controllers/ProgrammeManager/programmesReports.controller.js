const { HttpResponse } = require('@helpers');
const {
  programmesReportsService,
  institutionStructureService,
} = require('@services/index');
const { isEmpty } = require('lodash');

const http = new HttpResponse();

class ProgrammesReportsController {
  /**
   * fees preview controller
   * @param {*} req
   * @param {*} res
   */
  async programmesReports(req, res) {
    try {
      const programmesStudyLevel = await programmesReportsFunction();
      const coursesReports = await courseReportsFunction();
      const programmeCampuses = await programmeCampusesFunction();
      const programmesReport = await programmesSummaryFunction();
      const programmeCoursesReport = {
        programmesReport,
        programmesStudyLevel,
        coursesReports,
        programmeCampuses,
      };

      http.setSuccess(200, 'Programmes report fetched successfully ', {
        programmeCoursesReport,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Programmes Report', {
        error: { message: error },
      });

      return http.send(res);
    }
  }

  // institution setup report
  async institutionReports(req, res) {
    try {
      let institutionReport = {};

      let structure = 'Departments';
      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords();
      const institutionCampusReport = await numberCampusFunction();

      let institutionSetupReport = {};

      if (
        institutionStructure &&
        institutionStructure.academic_units.includes('Colleges')
      ) {
        structure = 'Colleges';
        institutionSetupReport = await institutionReportFunction();
      } else if (
        institutionStructure &&
        (institutionStructure.academic_units.includes('Faculties') ||
          institutionStructure.academic_units.includes('Schools'))
      ) {
        structure = institutionStructure.academic_units.includes('Faculties')
          ? 'Faculties'
          : 'Schools';
        institutionSetupReport = await institutionFacultyFunction();
      } else {
        institutionSetupReport = await institutionDepartmentFunction();
      }

      institutionReport = {
        ...institutionSetupReport,
        ...institutionCampusReport,
      };

      http.setSuccess(200, 'Institution setup reports fetched successfully', {
        data: { structure, institutionReport },
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Institution setup Report', {
        error: { message: error },
      });

      return http.send(res);
    }
  }
}

/**
 *numberProgrammesSummary
 *
 */
const programmesSummaryFunction = async (req) => {
  try {
    const result = await programmesReportsService.numberProgrammesSummary();

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

// programmes
const programmesReportsFunction = async (req) => {
  try {
    const result =
      await programmesReportsService.numberProgrammesByStudyLevel();

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * numberCoursesFunction
 */
const courseReportsFunction = async (req) => {
  try {
    const result = await programmesReportsService.numberCoursesFunction();

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};
// numberProgrammeCampusesFunction
const programmeCampusesFunction = async (req) => {
  try {
    const result =
      await programmesReportsService.numberProgrammeCampusesFunction();

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};
/**
 * institution setup reports
 *
 * numberCampus
 */

const institutionReportFunction = async (req) => {
  try {
    const result =
      await programmesReportsService.numberDepartmentsFacultiesColleges();

    return isEmpty(result) ? {} : result[0];
  } catch (error) {
    throw new Error(error.message);
  }
};
const institutionFacultyFunction = async (req) => {
  try {
    const result = await programmesReportsService.numberDepartmentsFaculties();

    return isEmpty(result) ? {} : result[0];
  } catch (error) {
    throw new Error(error.message);
  }
};

const institutionDepartmentFunction = async (req) => {
  try {
    const result = await programmesReportsService.numberDepartments();

    return isEmpty(result) ? {} : result[0];
  } catch (error) {
    throw new Error(error.message);
  }
};

// campuses

const numberCampusFunction = async (req) => {
  try {
    const result = await programmesReportsService.numberCampus();

    return isEmpty(result) ? {} : result[0];
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = ProgrammesReportsController;
