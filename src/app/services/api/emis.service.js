const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

const { QueryTypes } = require('sequelize');

// This Class is responsible for handling all database interactions for this entity
class EmisService {
  static async findInstitutionDetails(options) {
    try {
      const records = await models.InstitutionStructure.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `result.service.js`,
        `findAllResults`,
        `GET`
      );
    }
  }

  // api_mgt.api_admission_schemes

  static async apiAdmissionSchemes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select academic_year, degree_category, schemes from api_mgt.api_admission_schemes
        order by academic_year
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `studentResults`,
        `GET`
      );
    }
  }

  //  app_mgt.student_emis_function(academic_year bigint,intake bigint, campus bigint)
  static async apiStudent(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from app_mgt.student_emis_function(${data.academicYearId},${data.intake},${data.campus},${data.programmeId}) limit 2
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `studentResults`,
        `GET`
      );
    }
  }
}

module.exports = EmisService;
