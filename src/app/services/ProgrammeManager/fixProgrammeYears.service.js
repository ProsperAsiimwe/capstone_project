//
const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class FixProgrammeYearsService {
  static async duplicatedStudyYears(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from update_programme 
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `fixProgrammeYears.service.js`,
        `duplicatedStudyYears`,
        `GET`
      );
    }
  }
}

module.exports = FixProgrammeYearsService;
