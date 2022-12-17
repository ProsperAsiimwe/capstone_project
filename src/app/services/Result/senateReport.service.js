const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class SenateReportService {
  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createSenateReport(data, transaction) {
    try {
      const record = await models.SenateReport.findOrCreate({
        where: {
          campus_id: data.campus_id,
          intake_id: data.intake_id,
          programme_id: data.programme_id,
          academic_year_id: data.academic_year_id,
          study_year_id: data.study_year_id,
          semester_id: data.semester_id,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      if (record[1] === false) {
        await models.SenateReport.update(
          {
            ...data,
          },
          {
            where: {
              id: record[0].dataValues.id,
            },
            transaction,
            returning: true,
          }
        );
      }

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `senateReport.service.js`,
        `createSenateReport`,
        `POST`
      );
    }
  }

  // faculty report

  static async senateFacultyReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.senate_report_by_faculty(${data.academic_unit_id},${data.campus_id},
            ${data.academic_year_id},${data.intake_id})
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `senateReport.service.js`,
        `senateFacultyReport`,
        `GET`
      );
    }
  }

  // department
  static async senateDepartmentReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.senate_report_by_department(${data.academic_unit_id},${data.campus_id},
            ${data.academic_year_id},${data.intake_id})
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `senateReport.service.js`,
        `senateDepartmentReport`,
        `GET`
      );
    }
  }

  // senate report
  static async senateResultReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.result_senate_report(${data.campus_id},
            ${data.academic_year_id},${data.intake_id})
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `senateReport.service.js`,
        `senateResultReport`,
        `GET`
      );
    }
  }
}

module.exports = SenateReportService;
