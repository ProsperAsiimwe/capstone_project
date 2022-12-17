const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class MigratedEnrollmentRecordsService {
  // migrated enrollment record

  static async migratedEnrollmentRecords(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from students_data.migrated_enrollments('${data.student_number}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `migratedEnrollmentRecords.service.js`,
        `migratedEnrollmentRecords`,
        `GET`
      );
    }
  }

  // students_data.tuition_balances_by_programme(programme bigint)

  static async tuitionBalancesProgramme(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from students_data.tuition_balances_by_programme('${data.programme}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `migratedEnrollmentRecords.service.js`,
        `migratedEnrollmentRecords`,
        `GET`
      );
    }
  }
}

module.exports = MigratedEnrollmentRecordsService;
