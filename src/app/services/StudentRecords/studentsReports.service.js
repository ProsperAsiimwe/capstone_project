const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// student reports
class StudentReportsService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description registration number
   */
  static async numberStudentsByCampus() {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.student_campus_all_report_function()`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentsReports.service.js`,
        `numberStudentsByCampus`,
        `GET`
      );
    }
  }

  //  students_intake_function
  static async numberStudentsByIntake() {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.students_intake_function()`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentsReports.service.js`,
        `numberStudentsByIntake`,
        `GET`
      );
    }
  }

  /**
   *  residence
   */
  static async numberStudentsByResidence() {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.students_residence_function()`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentsReports.service.js`,
        `numberStudentsByResidence`,
        `GET`
      );
    }
  }

  // billing category
  static async numberStudentsByBillingCategory() {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.students_billing_category_function()`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentsReports.service.js`,
        `numberStudentsByBillingCategory`,
        `GET`
      );
    }
  }

  // account status

  static async numberStudentsByAccountStatus() {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.students_account_status_function()`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentsReports.service.js`,
        `numberStudentsByAccountStatus`,
        `GET`
      );
    }
  }

  // academic status

  static async numberStudentsByAcademicStatus() {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.students_academic_status_function()`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentsReports.service.js`,
        `numberStudentsByAcademicStatus`,
        `GET`
      );
    }
  }

  // sponsorship

  static async numberStudentsBySponsorship() {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.students_sponsorship_function()`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentsReports.service.js`,
        `numberStudentsBySponsorship`,
        `GET`
      );
    }
  }

  //  programme study year

  static async numberStudentsByStudyLevel() {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.students_study_level_function()`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentsReports.service.js`,
        `numberStudentsByStudyLevel`,
        `GET`
      );
    }
  }
  // by academic year

  static async numberActiveStudentsByAcademicYear() {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.students_entry_academic_years_function()`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentsReports.service.js`,
        `numberActiveStudentsByAcademicYear`,
        `GET`
      );
    }
  }

  //  all academic years

  static async numberStudentsAcademicYear(data) {
    try {
      const academicYear = data.academic_year_id;

      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.students_all_academic_years_function(ARRAY ${academicYear})
        ORDER BY entry_academic_year_id
        `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentsReports.service.js`,
        `numberStudentsAcademicYear`,
        `GET`
      );
    }
  }

  //  max academic years

  static async numberStudentsMaxAcademicYear(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.students_all_academic_years_function(ARRAY [${data}])
        ORDER BY entry_academic_year_id
        `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentsReports.service.js`,
        `numberStudentsMaxAcademicYear`,
        `GET`
      );
    }
  }

  // academic years
  static async getAcademicYears() {
    try {
      const filtered = await models.sequelize.query(
        `select CAST(mv.id AS bigint) as id,
      mv.metadata_value as academic_years 
      from app_mgt.metadata_values as mv 
      inner join app_mgt.metadata as md
      on md.id = mv.metadata_id
      where metadata_name = 'ACADEMIC YEARS'
      order by metadata_value DESC
      limit 5`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentsReports.service.js`,
        `getAcademicYears`,
        `GET`
      );
    }
  }
}

module.exports = StudentReportsService;
