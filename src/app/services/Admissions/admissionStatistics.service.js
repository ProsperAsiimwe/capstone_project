const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class AdmissionStatisticsService {
  static async admissionFacultyStatistics(data) {
    try {
      const filtered = await models.sequelize.query(
        `select ROW_NUMBER() OVER (ORDER BY academic_unit_title) AS no, *
         from admissions_mgt.admitted_faculty_statistics(${data.academic_year_id},
          ${data.intake_id})
          where sponsorship_id = ${data.sponsorship_id}
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
        `admissionStatistics.service.js`,
        `admissionFacultyStatistics`,
        `GET`
      );
    }
  }

  // admitted_college_statistics

  static async admissionCollegeStatistics(data) {
    try {
      const filtered = await models.sequelize.query(
        `select ROW_NUMBER() OVER (ORDER BY academic_unit_title) AS no, *
         from admissions_mgt.admitted_college_statistics(${data.academic_year_id},
          ${data.intake_id})
          where sponsorship_id = ${data.sponsorship_id}
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
        `admissionStatistics.service.js`,
        `admissionCollegeStatistics`,
        `GET`
      );
    }
  }
}

module.exports = AdmissionStatisticsService;
