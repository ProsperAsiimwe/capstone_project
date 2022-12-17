const { HttpResponse } = require('@helpers');
const { studentsReportsService } = require('@services/index');
const { isEmpty } = require('lodash');

const http = new HttpResponse();

class StudentsReportsController {
  /**
   * fees preview controller
   * @param {*} req
   * @param {*} res
   */
  async studentReportsFunction(req, res) {
    try {
      const campusStudents = await campusStudentsFunction();
      const intakeStudents = await intakeStudentsFunction();
      const residenceStudents = await residenceStudentsFunction();
      const billingCategoryStudents = await billingCategoryStudentsFunction();
      const accountStatusStudents = await accountStatusStudentsFunction();
      const academicStatusStudents = await academicStatusStudentsFunction();
      const sponsorshipStudents = await sponsorshipStudentsFunction();
      const studyLevelStudents = await studyLevelStudentsFunction();
      const entryAcademicYearStudents = await activeStudentsByAcademicYear();

      const studentsReport = {
        campusStudents,
        intakeStudents,
        residenceStudents,
        billingCategoryStudents,
        accountStatusStudents,
        academicStatusStudents,
        sponsorshipStudents,
        studyLevelStudents,
        entryAcademicYearStudents,
      };

      http.setSuccess(200, 'Students report fetched successfully ', {
        studentsReport,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Students Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // students by academic year
  async studentAcademicYearReportsFunction(req, res) {
    try {
      const context = req.query;

      let academicYearStudents = [];

      if (!context.academic_year_id) {
        academicYearStudents = await studentsMaxAcademicYear();
      }

      if (context.academic_year_id) {
        academicYearStudents = await studentsAcademicYear(context);
      }

      // academicYearStudents = await studentsAcademicYear(context);

      // if (!context.academic_year_id) {
      //   throw new Error('Invalid Context provided');
      // }

      // if (context.academic_year_id.length === 0) {
      //   throw new Error('No Academic Year Selected');
      // }

      http.setSuccess(200, 'Students report fetched successfully ', {
        academicYearStudents,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Students Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

/**
 *numberProgrammesSummary
 *
 */
const campusStudentsFunction = async (req) => {
  try {
    const result = await studentsReportsService.numberStudentsByCampus();

    const finalResult = [];

    result.forEach((element) => {
      const statistics = [];

      element.students.forEach((statistic) => {
        if (!isEmpty(statistic.students)) {
          statistics.push(statistic.students);
        }
      });

      finalResult.push({
        campus_id: element.campus_id,
        field_name: element.campus,
        statistics: statistics,
      });
    });

    return finalResult;
  } catch (error) {
    throw new Error(error.message);
  }
};

// numberStudentsByIntake
const intakeStudentsFunction = async (req) => {
  try {
    const result = await studentsReportsService.numberStudentsByIntake();

    const finalResult = [];

    result.forEach((element) => {
      const statistics = [];

      element.students.forEach((statistic) => {
        if (!isEmpty(statistic.students)) {
          statistics.push(statistic.students);
        }
      });

      finalResult.push({
        intake_id: element.intake_id,
        field_name: element.intake,
        statistics: statistics,
      });
    });

    return finalResult;
  } catch (error) {
    throw new Error(error.message);
  }
};

// residence

const residenceStudentsFunction = async (req) => {
  try {
    const result = await studentsReportsService.numberStudentsByResidence();
    const finalResult = [];

    result.forEach((element) => {
      const statistics = [];

      element.students.forEach((statistic) => {
        if (!isEmpty(statistic.students)) {
          statistics.push(statistic.students);
        }
      });

      finalResult.push({
        residence_status_id: element.residence_status_id,
        field_name: element.residence,
        statistics: statistics,
      });
    });

    return finalResult;
  } catch (error) {
    throw new Error(error.message);
  }
};

// billing category

const billingCategoryStudentsFunction = async (req) => {
  try {
    const result =
      await studentsReportsService.numberStudentsByBillingCategory();
    const finalResult = [];

    result.forEach((element) => {
      const statistics = [];

      element.students.forEach((statistic) => {
        if (!isEmpty(statistic.students)) {
          statistics.push(statistic.students);
        }
      });

      finalResult.push({
        billing_category_id: element.billing_category_id,
        field_name: element.billing_category,
        statistics: statistics,
      });
    });

    return finalResult;
  } catch (error) {
    throw new Error(error.message);
  }
};

// account status

const accountStatusStudentsFunction = async (req) => {
  try {
    const result = await studentsReportsService.numberStudentsByAccountStatus();

    const finalResult = [];

    result.forEach((element) => {
      const statistics = [];

      element.students.forEach((statistic) => {
        if (!isEmpty(statistic.students)) {
          statistics.push(statistic.students);
        }
      });

      finalResult.push({
        student_account_status_id: element.student_account_status_id,
        field_name: element.student_academic_status,
        statistics: statistics,
      });
    });

    return finalResult;
  } catch (error) {
    throw new Error(error.message);
  }
};

// academic status

const academicStatusStudentsFunction = async (req) => {
  try {
    const result =
      await studentsReportsService.numberStudentsByAcademicStatus();
    const finalResult = [];

    result.forEach((element) => {
      const statistics = [];

      element.students.forEach((statistic) => {
        if (!isEmpty(statistic.students)) {
          statistics.push(statistic.students);
        }
      });

      finalResult.push({
        student_academic_status_id: element.student_academic_status_id,
        field_name: element.student_academic_status,
        statistics: statistics,
      });
    });

    return finalResult;
  } catch (error) {
    throw new Error(error.message);
  }
};

// sponsorship

const sponsorshipStudentsFunction = async (req) => {
  try {
    const result = await studentsReportsService.numberStudentsBySponsorship();

    const finalResult = [];

    result.forEach((element) => {
      const statistics = [];

      element.students.forEach((statistic) => {
        if (!isEmpty(statistic.students)) {
          statistics.push(statistic.students);
        }
      });

      finalResult.push({
        sponsorship_id: element.sponsorship_id,
        field_name: element.sponsorship,
        statistics: statistics,
      });
    });

    return finalResult;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * programme study level
 */

const studyLevelStudentsFunction = async (req) => {
  try {
    const result = await studentsReportsService.numberStudentsByStudyLevel();

    const finalResult = [];

    result.forEach((element) => {
      const statistics = [];

      element.students.forEach((statistic) => {
        if (!isEmpty(statistic.students)) {
          statistics.push(statistic.students);
        }
      });

      finalResult.push({
        programme_study_level_id: element.programme_study_level_id,
        field_name: element.programme_study_level,
        statistics: statistics,
      });
    });

    return finalResult;
  } catch (error) {
    throw new Error(error.message);
  }
};

// active students  academic year

const activeStudentsByAcademicYear = async (req) => {
  try {
    const result =
      await studentsReportsService.numberActiveStudentsByAcademicYear();

    const finalResult = [];

    result.forEach((element) => {
      const statistics = [];

      element.students.forEach((statistic) => {
        if (!isEmpty(statistic.students)) {
          statistics.push(statistic.students);
        }
      });

      finalResult.push({
        entry_academic_year_id: element.entry_academic_year_id,
        field_name: element.entry_academic_year,
        statistics: statistics,
      });
    });

    return finalResult;
  } catch (error) {
    throw new Error(error.message);
  }
};

//  students in all academic years

const studentsAcademicYear = async (req) => {
  try {
    const result = await studentsReportsService.numberStudentsAcademicYear(req);

    const finalResult = [];

    result.forEach((element) => {
      const statistics = [];

      element.students.forEach((statistic) => {
        if (!isEmpty(statistic.students)) {
          statistics.push(statistic.students);
        }
      });

      finalResult.push({
        entry_academic_year_id: element.entry_academic_year_id,
        field_name: element.entry_academic_year,
        statistics: statistics,
      });
    });

    return finalResult;
  } catch (error) {
    throw new Error(error.message);
  }
};

// academic years by metadata
const studentsMaxAcademicYear = async (req) => {
  try {
    const academicYear = await studentsReportsService.getAcademicYears();

    if (isEmpty(academicYear)) {
      throw new Error('No Academic Years Defined');
    }
    const filtered = academicYear.map((element) => Number(element.id));

    const result = await studentsReportsService.numberStudentsMaxAcademicYear(
      filtered
    );

    const finalResult = [];

    result.forEach((element) => {
      const statistics = [];

      element.students.forEach((statistic) => {
        if (!isEmpty(statistic.students)) {
          statistics.push(statistic.students);
        }
      });

      finalResult.push({
        entry_academic_year_id: element.entry_academic_year_id,
        field_name: element.entry_academic_year,
        statistics: statistics,
      });
    });

    return finalResult;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = StudentsReportsController;
