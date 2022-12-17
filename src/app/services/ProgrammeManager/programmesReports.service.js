const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// Search student records
class ProgrammesReportsService {
  /**
   *
   * @returns
   *
   *
   * programmes_report_function
   */
  static async numberProgrammesSummary() {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  programme_mgt.programmes_report_function()`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmesReports.service.js`,
        `numberProgrammesSummary`,
        `GET`
      );
    }
  }

  // number of programme by study level

  static async numberProgrammesByStudyLevel() {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  programme_mgt.programmes_summary_report_function()`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmesReports.service.js`,
        `numberProgrammesByStudyLevel`,
        `GET`
      );
    }
  }

  // courses_summary_report_function
  static async numberCoursesFunction() {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  programme_mgt.courses_summary_report_function()`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmesReports.service.js`,
        `numberCoursesFunction`,
        `GET`
      );
    }
  }

  // programme_campuses_report_function
  static async numberProgrammeCampusesFunction() {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  programme_mgt.programme_campuses_report_function()`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmesReports.service.js`,
        `numberProgrammeCampusesFunction`,
        `GET`
      );
    }
  }

  /**
   * institution setup reports
   *
   *programme_mgt.institution_campuses_report_function()
   programme_mgt.institution_summary_report_function()
   */
  static async numberDepartmentsFacultiesColleges() {
    try {
      const filtered = await models.sequelize.query(
        `select * from programme_mgt.institution_summary_report_function()`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmesReports.service.js`,
        `numberDepartmentsFacultiesColleges`,
        `GET`
      );
    }
  }

  static async numberDepartmentsFaculties() {
    try {
      const filtered = await models.sequelize.query(
        `select * from programme_mgt.institution_faculty_report_function()`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmesReports.service.js`,
        `numberDepartmentsFaculties`,
        `GET`
      );
    }
  }

  static async numberDepartments() {
    try {
      const filtered = await models.sequelize.query(
        `select * from programme_mgt.institution_department_report_function()`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmesReports.service.js`,
        `numberDepartments`,
        `GET`
      );
    }
  }
  // campuses

  static async numberCampus() {
    try {
      const filtered = await models.sequelize.query(
        `select * from programme_mgt.institution_campuses_report_function()`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmesReports.service.js`,
        `numberCampus`,
        `GET`
      );
    }
  }
}

module.exports = ProgrammesReportsService;
