const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class RegistrationStatisticsService {
  static async detailedRegistrationStatistics(data) {
    try {
      const filtered = await models.sequelize.query(
        `select ROW_NUMBER() OVER (ORDER BY academic_unit_title) AS no, *
         from enrollment_and_registration_mgt.registration_statistics_report(${data.academic_year_id},
          ${data.intake_id},'${data.semester_id}','${data.campus_id}')
          order by ROW_NUMBER() OVER (ORDER BY academic_unit_title) , academic_unit_code,academic_unit_title,programme_code
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registrationStatistics.service.js`,
        `detailedRegistrationStatistics`,
        `GET`
      );
    }
  }

  // enrollment_and_registration_mgt.registration_statistics_report_college

  static async detailedRegistrationStatisticsCollege(data) {
    try {
      const filtered = await models.sequelize.query(
        `select ROW_NUMBER() OVER (ORDER BY academic_unit_title) AS no, *
         from enrollment_and_registration_mgt.registration_statistics_report_college(${data.academic_year_id},
          ${data.intake_id},'${data.semester_id}','${data.campus_id}')
          order by ROW_NUMBER() OVER (ORDER BY academic_unit_title) , academic_unit_code,academic_unit_title,programme_code
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registrationStatistics.service.js`,
        `detailedRegistrationStatisticsCollege`,
        `GET`
      );
    }
  }
}

module.exports = RegistrationStatisticsService;
